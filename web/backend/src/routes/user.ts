/**
 * User API Routes
 * Handles user preferences and dashboard data
 */

import { Hono } from 'hono';
import { Env } from '../types/env';
import { createEncryptionService } from '../services/encryption';
import { createCachedGitHubService } from '../services/github-cached';

const user = new Hono<{ Bindings: Env }>();

/**
 * POST /api/user/preferences
 * Update user notification preferences
 */
user.post('/preferences', async (c) => {
	try {
		const body = await c.req.json();
		const { userId, githubUsername, githubPat, discordWebhook, telegramToken, telegramChatId } = body;

		if (!githubUsername) {
			return c.json({ error: 'GitHub username is required' }, 400);
		}

		if (!githubPat) {
			return c.json({ error: 'GitHub Personal Access Token is required' }, 400);
		}

		// Validate GitHub PAT format
		if (githubPat && !/^(ghp|github_pat)_\w+$/.test(githubPat)) {
			return c.json({ error: 'Invalid GitHub Personal Access Token format' }, 400);
		}

		// Validate Discord webhook URL
		if (discordWebhook && !discordWebhook.startsWith('https://discord.com/api/webhooks/')) {
			return c.json({ error: 'Invalid Discord webhook URL' }, 400);
		}

		// Validate Telegram credentials
		if (telegramToken && !/^\d+:[A-Za-z0-9_-]+$/.test(telegramToken)) {
			return c.json({ error: 'Invalid Telegram bot token format' }, 400);
		}

		if (telegramChatId && !/^\d+$/.test(telegramChatId)) {
			return c.json({ error: 'Invalid Telegram chat ID format' }, 400);
		}

		// Encrypt sensitive data
		const encryptionService = await createEncryptionService(c.env.ENCRYPTION_KEY);

		const encryptedGithubPat = githubPat ? await encryptionService.encrypt(githubPat) : null;
		const encryptedDiscord = discordWebhook ? await encryptionService.encrypt(discordWebhook) : null;
		const encryptedTelegramToken = telegramToken ? await encryptionService.encrypt(telegramToken) : null;
		const encryptedTelegramChatId = telegramChatId ? await encryptionService.encrypt(telegramChatId) : null;

		// Check if user exists
		const existingUser = await c.env.DB.prepare(
			`
      SELECT id FROM users WHERE github_username = ?
    `
		)
			.bind(githubUsername)
			.first();

		if (existingUser) {
			// Update existing user
			await c.env.DB.prepare(
				`
        UPDATE users 
        SET github_pat = ?,
            discord_webhook = ?, 
            telegram_token = ?, 
            telegram_chat_id = ?,
            updated_at = datetime('now')
        WHERE github_username = ?
      `
			)
				.bind(encryptedGithubPat, encryptedDiscord, encryptedTelegramToken, encryptedTelegramChatId, githubUsername)
				.run();
		} else {
			// Create new user
			const newUserId = userId || crypto.randomUUID();
			await c.env.DB.prepare(
				`
        INSERT INTO users (id, github_username, github_id, github_pat, discord_webhook, telegram_token, telegram_chat_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `
			)
				.bind(
					newUserId,
					githubUsername,
					githubUsername, // Use username as github_id for now
					encryptedGithubPat,
					encryptedDiscord,
					encryptedTelegramToken,
					encryptedTelegramChatId
				)
				.run();
		}

		return c.json({
			success: true,
			message: 'Preferences updated successfully',
		});
	} catch (error) {
		console.error('Error updating preferences:', error);
		return c.json(
			{
				error: 'Failed to update preferences',
			},
			500
		);
	}
});

/**
 * GET /api/user/dashboard
 * Get dashboard data (streak, contributions, notifications)
 */
user.get('/dashboard', async (c) => {
	try {
		const userId = c.req.query('userId');

		if (!userId) {
			return c.json({ error: 'User ID is required' }, 400);
		}

		// Fetch user from database (userId can be either id or github_username)
		const userResult = await c.env.DB.prepare(
			`
      SELECT * FROM users WHERE id = ? OR github_username = ?
    `
		)
			.bind(userId, userId)
			.first();

		if (!userResult) {
			return c.json({ error: 'User not found' }, 404);
		}

		const user = userResult as any;

		// Check if user has GitHub PAT
		if (!user.github_pat) {
			return c.json(
				{
					error: 'GitHub Personal Access Token not configured. Please add it in settings.',
				},
				400
			);
		}

		// Decrypt GitHub PAT
		const encryptionService = await createEncryptionService(c.env.ENCRYPTION_KEY);
		const decryptedPat = await encryptionService.decrypt(user.github_pat);

		// Fetch GitHub data using user's PAT
		const githubService = createCachedGitHubService(decryptedPat, 5);

		const [contributionsToday, currentStreak] = await Promise.all([
			githubService.getContributionsToday(user.github_username),
			githubService.getCurrentStreak(user.github_username),
		]);

		// Fetch recent notifications
		const notificationsResult = await c.env.DB.prepare(
			`
      SELECT id, channel, status, error_message, sent_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY sent_at DESC
      LIMIT 10
    `
		)
			.bind(userId)
			.all();

		const notifications = notificationsResult.results || [];

		return c.json({
			username: user.github_username,
			currentStreak,
			contributedToday: contributionsToday > 0,
			contributionsToday,
			notifications: notifications.map((n: any) => ({
				id: n.id,
				channel: n.channel,
				status: n.status,
				errorMessage: n.error_message,
				sentAt: n.sent_at,
			})),
		});
	} catch (error) {
		console.error('Error fetching dashboard data:', error);
		return c.json(
			{
				error: 'Failed to fetch dashboard data',
			},
			500
		);
	}
});

export default user;

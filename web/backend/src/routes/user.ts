/**
 * User API Routes
 * Handles user preferences and dashboard data
 */

import { Hono } from 'hono';
import { Env } from '../types/env';
import { createEncryptionService } from '../services/encryption';
import { createCachedGitHubService } from '../services/github-cached';
import { authMiddleware, getAuthUser, AuthUser } from '../middleware/auth';

const user = new Hono<{ Bindings: Env; Variables: { user: AuthUser } }>();

/**
 * POST /api/user/preferences
 * Update user notification preferences
 */
user.post('/preferences', authMiddleware, async (c) => {
	try {
		// Get authenticated user from context
		const authUser = getAuthUser(c);
		if (!authUser) {
			return c.json({ error: 'Unauthorized' }, 401);
		}

		const body = await c.req.json();
		const { githubPat, discordWebhook, telegramToken, telegramChatId } = body;

		// Use authenticated user's GitHub username
		const githubUsername = authUser.githubUsername;

		// Check if user exists first
		const existingUser = await c.env.DB.prepare(`SELECT id, github_pat FROM users WHERE github_username = ?`).bind(githubUsername).first();

		// If user doesn't exist, PAT is required
		if (!existingUser && !githubPat) {
			return c.json({ error: 'GitHub Personal Access Token is required for new users' }, 400);
		}

		// If updating existing user without PAT, that's okay (keep existing PAT)
		// If PAT is provided, validate format
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

		if (existingUser) {
			// Update existing user - only update fields that are provided
			const updates: string[] = [];
			const values: any[] = [];

			if (encryptedGithubPat) {
				updates.push('github_pat = ?');
				values.push(encryptedGithubPat);
			}
			if (discordWebhook !== undefined) {
				updates.push('discord_webhook = ?');
				values.push(encryptedDiscord);
			}
			if (telegramToken !== undefined) {
				updates.push('telegram_token = ?');
				values.push(encryptedTelegramToken);
			}
			if (telegramChatId !== undefined) {
				updates.push('telegram_chat_id = ?');
				values.push(encryptedTelegramChatId);
			}

			if (updates.length > 0) {
				updates.push("updated_at = datetime('now')");
				values.push(githubUsername);

				await c.env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE github_username = ?`)
					.bind(...values)
					.run();
			}
		} else {
			// Create new user with authenticated user ID
			await c.env.DB.prepare(
				`
        INSERT INTO users (id, github_username, github_id, github_pat, discord_webhook, telegram_token, telegram_chat_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `
			)
				.bind(
					authUser.id,
					githubUsername,
					authUser.id, // Use authenticated user ID
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
user.get('/dashboard', authMiddleware, async (c) => {
	try {
		// Get authenticated user from context
		const authUser = getAuthUser(c);
		if (!authUser) {
			return c.json({ error: 'Unauthorized' }, 401);
		}

		// Fetch user from database using authenticated user's ID
		const userResult = await c.env.DB.prepare(
			`
      SELECT * FROM users WHERE id = ? OR github_username = ?
    `
		)
			.bind(authUser.id, authUser.githubUsername)
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

		// Fetch recent notifications using database user's ID (not OAuth ID)
		const notificationsResult = await c.env.DB.prepare(
			`
      SELECT id, channel, status, error_message, sent_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY sent_at DESC
      LIMIT 10
    `
		)
			.bind(user.id)
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

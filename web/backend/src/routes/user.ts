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
		const { githubPat, discordWebhook, telegramToken, telegramChatId, reminderUtcHour } = body;

		// Use authenticated user's GitHub username
		const githubUsername = authUser.githubUsername;
		const userId = authUser.id;

		// Check if user exists first
		const existingUser = await c.env.DB.prepare(`SELECT id, github_pat FROM users WHERE github_id = ?`).bind(userId).first();

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

		// Validate reminder UTC hour (0-23)
		if (reminderUtcHour !== undefined) {
			const n = Number(reminderUtcHour);
			if (!Number.isInteger(n) || n < 0 || n > 23) {
				return c.json({ error: 'Invalid reminder UTC hour (must be integer 0-23)' }, 400);
			}
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

			updates.push('github_username = ?');
			values.push(githubUsername);
			updates.push('github_id = ?');
			values.push(userId);

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
				if (reminderUtcHour !== undefined) {
					updates.push('reminder_utc_hour = ?');
					values.push(Number(reminderUtcHour));
				}

			updates.push("updated_at = datetime('now')");
			values.push(userId);

			await c.env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE github_id = ?`)
				.bind(...values)
				.run();
		} else {
			// Create new user with authenticated user ID
			await c.env.DB.prepare(
				`
        INSERT INTO users (id, github_username, github_id, github_pat, discord_webhook, telegram_token, telegram_chat_id, reminder_utc_hour, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `
			)
				.bind(
					authUser.id,
					githubUsername,
					authUser.id, // Use authenticated user ID
					encryptedGithubPat,
					encryptedDiscord,
					encryptedTelegramToken,
						encryptedTelegramChatId,
						reminderUtcHour !== undefined ? Number(reminderUtcHour) : 12
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
 * GET /api/user/preferences
 * Lightweight preferences status for UI (no GitHub API calls)
 */
user.get('/preferences', authMiddleware, async (c) => {
	try {
		const authUser = getAuthUser(c);
		if (!authUser) {
			return c.json({ error: 'Unauthorized' }, 401);
		}

		const userResult = await c.env.DB.prepare(
			`SELECT github_pat, discord_webhook, telegram_token, telegram_chat_id, reminder_utc_hour
			 FROM users
			 WHERE github_id = ?`
		)
			.bind(authUser.id)
			.first();

		if (!userResult) {
			return c.json({
				hasPat: false,
				hasDiscord: false,
				hasTelegram: false,
				reminderUtcHour: 12,
			});
		}

		const u = userResult as any;
		return c.json({
			hasPat: !!u.github_pat,
			hasDiscord: !!u.discord_webhook,
			hasTelegram: !!(u.telegram_token && u.telegram_chat_id),
			reminderUtcHour: typeof u.reminder_utc_hour === 'number' ? u.reminder_utc_hour : Number(u.reminder_utc_hour) || 12,
		});
	} catch (error) {
		console.error('Error fetching preferences status:', error);
		return c.json({ error: 'Failed to fetch preferences' }, 500);
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
			  SELECT * FROM users WHERE github_id = ?
			`
		)
			.bind(authUser.id)
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

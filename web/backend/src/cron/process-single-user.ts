/**
 * Single User Processing
 * Extracted from streak-checker.ts for distributed queue pattern
 * Process one user per worker request for scalability
 */

import { Env } from '../types/env';
import { createEncryptionService } from '../services/encryption';
import { createCachedGitHubService } from '../services/github-cached';
import { createNotificationService } from '../services/notifications';

interface User {
	id: string;
	github_username: string;
	github_pat: string | null;
	discord_webhook: string | null;
	telegram_token: string | null;
	telegram_chat_id: string | null;
}

/**
 * Process a single user - check streak and send notifications
 * @param env - Worker environment
 * @param userId - User ID to process
 * @throws Error if user not found or processing fails
 */
export async function processSingleUser(env: Env, userId: string): Promise<void> {
	// Fetch user from D1
	const user = await env.DB.prepare(
		`SELECT id, github_username, github_pat, discord_webhook, telegram_token, telegram_chat_id
     FROM users
     WHERE id = ? AND is_active = 1`
	)
		.bind(userId)
		.first<User>();

	if (!user) {
		throw new Error(`User ${userId} not found or inactive`);
	}

	// Validate GitHub PAT
	if (!user.github_pat) {
		throw new Error(`User ${user.github_username} has no GitHub PAT configured`);
	}

	// Initialize services
	const encryptionService = await createEncryptionService(env.ENCRYPTION_KEY);
	const notificationService = createNotificationService(env);

	// Decrypt GitHub PAT
	const decryptedPat = await encryptionService.decrypt(user.github_pat);

	// Create GitHub service with user's PAT
	const githubService = createCachedGitHubService(decryptedPat, 5);

	// Check contributions and streak
	const contributionsToday = await githubService.getContributionsToday(user.github_username);
	const currentStreak = await githubService.getCurrentStreak(user.github_username);

	// Prepare notification message
	let notificationMessage;

	if (contributionsToday > 0) {
		// User has contributed - send encouragement
		console.log(`[Process] User ${user.github_username} has ${contributionsToday} contributions today`);
		notificationMessage = {
			username: user.github_username,
			currentStreak,
			contributionsToday,
			message: `🎉 Great job! You made ${contributionsToday} contribution${
				contributionsToday > 1 ? 's' : ''
			} today! Your ${currentStreak}-day streak is safe. Keep it up!`,
		};
	} else {
		// User has NOT contributed - send warning
		console.log(`[Process] User ${user.github_username} has 0 contributions today - sending warning`);
		notificationMessage = {
			username: user.github_username,
			currentStreak,
			contributionsToday: 0,
			message: `⚠️ You have not made any contributions today! Your ${currentStreak}-day streak is at risk. Make a commit to keep it alive!`,
		};
	}

	// Send Discord notification if configured
	if (user.discord_webhook) {
		try {
			const discordResult = await notificationService.sendDiscordNotification(user.discord_webhook, notificationMessage);

			// Log notification result
			await logNotification(env, user.id, 'discord', discordResult.success ? 'sent' : 'failed', discordResult.error);

			if (discordResult.success) {
				console.log(`[Process] Discord notification sent to ${user.github_username}`);
			} else {
				console.error(`[Process] Discord notification failed for ${user.github_username}:`, discordResult.error);
			}
		} catch (error) {
			console.error(`[Process] Error sending Discord notification to ${user.github_username}:`, error);
			// Don't throw - continue with Telegram if configured
		}
	}

	// Send Telegram notification if configured
	if (user.telegram_token && user.telegram_chat_id) {
		try {
			const telegramResult = await notificationService.sendTelegramNotification(
				user.telegram_token,
				user.telegram_chat_id,
				notificationMessage
			);

			// Log notification result
			await logNotification(env, user.id, 'telegram', telegramResult.success ? 'sent' : 'failed', telegramResult.error);

			if (telegramResult.success) {
				console.log(`[Process] Telegram notification sent to ${user.github_username}`);
			} else {
				console.error(`[Process] Telegram notification failed for ${user.github_username}:`, telegramResult.error);
			}
		} catch (error) {
			console.error(`[Process] Error sending Telegram notification to ${user.github_username}:`, error);
			// Don't throw - notification errors shouldn't fail the whole process
		}
	}

	console.log(`[Process] User ${user.github_username} processed successfully`);
}

/**
 * Log notification to database
 */
async function logNotification(
	env: Env,
	userId: string,
	channel: 'discord' | 'telegram',
	status: 'sent' | 'failed',
	errorMessage?: string
): Promise<void> {
	try {
		const notificationId = crypto.randomUUID();
		await env.DB.prepare(
			`INSERT INTO notifications (id, user_id, channel, status, error_message)
       VALUES (?, ?, ?, ?, ?)`
		)
			.bind(notificationId, userId, channel, status, errorMessage || null)
			.run();
	} catch (error) {
		console.error('[Process] Error logging notification:', error);
		// Don't throw - logging failure shouldn't stop processing
	}
}

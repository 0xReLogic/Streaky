/**
 * Streak Checker Cron Job (DEPRECATED)
 * 
 * ⚠️ DEPRECATED: This sequential processing approach has been replaced by
 * distributed queue pattern (process-single-user.ts + routes/cron.ts)
 * 
 * Status:
 * - Still used by manual trigger endpoint for testing/emergency
 * - Kept as backup/fallback mechanism
 * - Will be removed after 2 weeks of stable distributed system
 * 
 * New System:
 * - See: src/cron/process-single-user.ts (single user logic)
 * - See: src/routes/cron.ts (dispatcher + endpoints)
 * - See: src/services/queue.ts (D1 queue management)
 * 
 * Migration Date: 2025-10-19
 * Removal Target: 2025-11-02 (after stability confirmed)
 * 
 * Original Purpose:
 * Legacy note: this archived implementation used to run daily at 8 PM UTC to check all users' GitHub contributions
 * Sends notifications if no contributions made today
 * 
 * Limitation:
 * - Sequential processing (TLE risk with 200+ users)
 * - CPU time: 1000ms+ for 100 users (approaching limits)
 * - No fault isolation (1 user fails = all fail)
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
 * Check all users' streaks and send notifications
 */
export async function checkAllUsersStreaks(env: Env): Promise<void> {
	console.log('[Cron] Starting streak check at', new Date().toISOString());

	try {
		// Fetch all active users with GitHub PAT configured
		const usersResult = await env.DB.prepare(
			`
      SELECT id, github_username, github_pat, discord_webhook, telegram_token, telegram_chat_id
      FROM users
      WHERE is_active = 1 AND github_pat IS NOT NULL
    `
		).all();

		const users = (usersResult.results || []) as unknown as User[];
		console.log(`[Cron] Found ${users.length} active users to check`);

		if (users.length === 0) {
			console.log('[Cron] No active users found');
			return;
		}

		// Initialize services
		const encryptionService = await createEncryptionService(env.ENCRYPTION_KEY);
		const notificationService = createNotificationService(env);

		let checkedCount = 0;
		let notifiedCount = 0;
		let errorCount = 0;

		// Process each user
		for (const user of users) {
			try {
				checkedCount++;

				// Skip if user doesn't have GitHub PAT
				if (!user.github_pat) {
					console.log(`[Cron] User ${user.github_username} has no GitHub PAT - skipping`);
					continue;
				}

				// Decrypt user's GitHub PAT
				const decryptedPat = await encryptionService.decrypt(user.github_pat);

				// Create GitHub service with user's PAT
				const githubService = createCachedGitHubService(decryptedPat, 5);

				// Check if user has contributed today
				const contributionsToday = await githubService.getContributionsToday(user.github_username);
				const currentStreak = await githubService.getCurrentStreak(user.github_username);

				// Prepare notification message based on contribution status
				let notificationMessage;

				if (contributionsToday > 0) {
					// User has contributed - send encouragement
					console.log(`[Cron] User ${user.github_username} has ${contributionsToday} contributions today - sending encouragement`);
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
					console.log(`[Cron] User ${user.github_username} has 0 contributions today - sending warning`);
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
						// Send encrypted webhook directly - VPS will decrypt it
						const discordResult = await notificationService.sendDiscordNotification(user.discord_webhook, notificationMessage);

						// Log notification result
						await logNotification(env, user.id, 'discord', discordResult.success ? 'sent' : 'failed', discordResult.error);

						if (discordResult.success) {
							notifiedCount++;
							console.log(`[Cron] Discord notification sent to ${user.github_username}`);
						} else {
							errorCount++;
							console.error(`[Cron] Discord notification failed for ${user.github_username}:`, discordResult.error);
						}
					} catch (error) {
						errorCount++;
						console.error(`[Cron] Error sending Discord notification to ${user.github_username}:`, error);
					}
				}

				// Send Telegram notification if configured
				if (user.telegram_token && user.telegram_chat_id) {
					try {
						// Send encrypted credentials directly - VPS will decrypt them
						const telegramResult = await notificationService.sendTelegramNotification(user.telegram_token, user.telegram_chat_id, notificationMessage);

						// Log notification result
						await logNotification(env, user.id, 'telegram', telegramResult.success ? 'sent' : 'failed', telegramResult.error);

						if (telegramResult.success) {
							notifiedCount++;
							console.log(`[Cron] Telegram notification sent to ${user.github_username}`);
						} else {
							errorCount++;
							console.error(`[Cron] Telegram notification failed for ${user.github_username}:`, telegramResult.error);
						}
					} catch (error) {
						errorCount++;
						console.error(`[Cron] Error sending Telegram notification to ${user.github_username}:`, error);
					}
				}
			} catch (error) {
				errorCount++;
				console.error(`[Cron] Error processing user ${user.github_username}:`, error);
				// Continue processing other users
			}
		}

		console.log(`[Cron] Streak check completed:`, {
			totalUsers: users.length,
			checked: checkedCount,
			notificationsSent: notifiedCount,
			errors: errorCount,
		});
	} catch (error) {
		console.error('[Cron] Fatal error in streak checker:', error);
		throw error;
	}
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
			`
      INSERT INTO notifications (id, user_id, channel, status, error_message)
      VALUES (?, ?, ?, ?, ?)
    `
		)
			.bind(notificationId, userId, channel, status, errorMessage || null)
			.run();
	} catch (error) {
		console.error('[Cron] Error logging notification:', error);
		// Don't throw - logging failure shouldn't stop the cron job
	}
}

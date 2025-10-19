/**
 * Notification Service
 * Handles sending notifications via Discord and Telegram
 */

import { Env } from 'hono';

import { Env } from 'hono';

import { Env } from 'hono';

export interface NotificationMessage {
	username: string;
	currentStreak: number;
	contributionsToday?: number;
	message: string;
}

export interface NotificationResult {
	success: boolean;
	error?: string;
}

export interface NotificationService {
	sendDiscordNotification(webhookUrl: string, message: NotificationMessage): Promise<NotificationResult>;
	sendTelegramNotification(token: string, chatId: string, message: NotificationMessage): Promise<NotificationResult>;
}

export class NotificationServiceImpl implements NotificationService {
	private env: Env;

	constructor(env: Env) {
		this.env = env;
	}

	/**
	 * Send notification via Discord webhook
	 * @param webhookUrl - Discord webhook URL
	 * @param message - Notification message data
	 */
	async sendDiscordNotification(webhookUrl: string, message: NotificationMessage): Promise<NotificationResult> {
		// Call Rust VPS proxy instead of direct Discord API
		try {
			const vpsUrl = this.env.VPS_URL;
			const vpsSecret = this.env.VPS_SECRET;

			if (!vpsUrl || !vpsSecret) {
				return {
					success: false,
					error: 'VPS_URL or VPS_SECRET not configured',
				};
			}

			const payload = {
				type: 'discord',
				encrypted_webhook: webhookUrl, // Already encrypted from D1
				message: {
					username: message.username,
					current_streak: message.currentStreak,
					contributions_today: message.contributionsToday,
					message: message.message,
				},
			};

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

			const response = await fetch(`${vpsUrl}/send-notification`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Secret': vpsSecret,
				},
				body: JSON.stringify(payload),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				return {
					success: false,
					error: `VPS proxy error: ${response.status} ${errorText}`,
				};
			}

			const result = await response.json();
			return result;
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				return {
					success: false,
					error: 'VPS proxy timeout (5s)',
				};
			}
			return {
				success: false,
				error: `Discord notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
			};
		}
	}

	/**
	 * Send notification via Telegram Bot API
	 * @param token - Telegram bot token
	 * @param chatId - Telegram chat ID
	 * @param message - Notification message data
	 */
	async sendTelegramNotification(token: string, chatId: string, message: NotificationMessage): Promise<NotificationResult> {
		// Call Rust VPS proxy instead of direct Telegram API
		try {
			const vpsUrl = this.env.VPS_URL;
			const vpsSecret = this.env.VPS_SECRET;

			if (!vpsUrl || !vpsSecret) {
				return {
					success: false,
					error: 'VPS_URL or VPS_SECRET not configured',
				};
			}

			const payload = {
				type: 'telegram',
				encrypted_token: token, // Already encrypted from D1
				encrypted_chat_id: chatId, // Already encrypted from D1
				message: {
					username: message.username,
					current_streak: message.currentStreak,
					contributions_today: message.contributionsToday,
					message: message.message,
				},
			};

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

			const response = await fetch(`${vpsUrl}/send-notification`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Secret': vpsSecret,
				},
				body: JSON.stringify(payload),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				return {
					success: false,
					error: `VPS proxy error: ${response.status} ${errorText}`,
				};
			}

			const result = await response.json();
			return result;
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				return {
					success: false,
					error: 'VPS proxy timeout (5s)',
				};
			}
			return {
				success: false,
				error: `Telegram notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
			};
		}
	}
}

/**
 * Create notification service instance
 */
export function createNotificationService(env: Env): NotificationService {
	return new NotificationServiceImpl(env);
}

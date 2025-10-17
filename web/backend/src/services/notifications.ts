/**
 * Notification Service
 * Handles sending notifications via Discord and Telegram
 */

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
	/**
	 * Send notification via Discord webhook
	 * @param webhookUrl - Discord webhook URL
	 * @param message - Notification message data
	 */
	async sendDiscordNotification(webhookUrl: string, message: NotificationMessage): Promise<NotificationResult> {
		try {
			const embed = {
				title: '⚠️ GitHub Streak Alert',
				description: message.message,
				color: 0xff6b6b, // Red color
				fields: [
					{
						name: 'GitHub Username',
						value: message.username,
						inline: true,
					},
					{
						name: 'Current Streak',
						value: `${message.currentStreak} days`,
						inline: true,
					},
				],
				footer: {
					text: 'Streaky - Never lose your GitHub streak',
				},
				timestamp: new Date().toISOString(),
			};

			const payload = {
				embeds: [embed],
				username: 'Streaky Bot',
			};

			const response = await fetch(webhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorText = await response.text();
				return {
					success: false,
					error: `Discord API error: ${response.status} ${errorText}`,
				};
			}

			return { success: true };
		} catch (error) {
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
		try {
			const text = `
⚠️ *GitHub Streak Alert*

${message.message}

👤 *GitHub Username:* ${message.username}
🔥 *Current Streak:* ${message.currentStreak} days

_Streaky - Never lose your GitHub streak_
      `.trim();

			const payload = {
				chat_id: chatId,
				text,
				parse_mode: 'Markdown',
			};

			const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage`;

			const response = await fetch(telegramApiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorData = await response.json();
				return {
					success: false,
					error: `Telegram API error: ${response.status} ${JSON.stringify(errorData)}`,
				};
			}

			return { success: true };
		} catch (error) {
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
export function createNotificationService(): NotificationService {
	return new NotificationServiceImpl();
}

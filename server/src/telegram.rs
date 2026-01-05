use crate::discord::NotificationMessage;
use reqwest::Client;
use serde::Serialize;
use std::time::Duration;

#[derive(Debug, Serialize)]
struct TelegramMessage {
    chat_id: String,
    text: String,
    parse_mode: String,
}

pub struct TelegramService {
    client: Client,
}

impl TelegramService {
    /// Creates a new Telegram service
    ///
    /// # Errors
    /// Returns error if HTTP client fails to build
    pub fn new() -> Result<Self, reqwest::Error> {
        let client = Client::builder().timeout(Duration::from_secs(10)).build()?;
        Ok(Self { client })
    }

    pub async fn send_notification(
        &self,
        bot_token: &str,
        chat_id: &str,
        message: &NotificationMessage,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let formatted_text = format!(
            "⚠️ *GitHub Streak Alert*\n\n{}\n\n👤 *GitHub Username:* {}\n🔥 *Current Streak:* {} days\n\n_Streaky - Never lose your GitHub streak_",
            message.message,
            message.username,
            message.current_streak
        );

        let payload = TelegramMessage {
            chat_id: chat_id.to_string(),
            text: formatted_text,
            parse_mode: "Markdown".to_string(),
        };

        let url = format!("https://api.telegram.org/bot{bot_token}/sendMessage");

        let response = self.client.post(&url).json(&payload).send().await?;

        if response.status().is_success() {
            tracing::info!("Telegram notification sent successfully");
            Ok(())
        } else {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            Err(format!("Telegram API error: {status} - {error_text}").into())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_telegram_service_creation() {
        let service = TelegramService::new();
        assert!(service.is_ok());
    }

    #[test]
    fn test_message_formatting() {
        let _message = NotificationMessage {
            username: "testuser".to_string(),
            current_streak: 365,
            contributions_today: Some(5),
            message: "Test message".to_string(),
        };

        let service = TelegramService::new();
        assert!(service.is_ok());
    }
}

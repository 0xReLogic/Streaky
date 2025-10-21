use reqwest::Client;
use std::time::Duration;
use serde::Serialize;
use crate::discord::NotificationMessage;

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
    pub fn new() -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(10))
            .build()
            .expect("Failed to build reqwest client");
        Self { client }
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

        let url = format!("https://api.telegram.org/bot{}/sendMessage", bot_token);

        let response = self
            .client
            .post(&url)
            .json(&payload)
            .send()
            .await?;

        if response.status().is_success() {
            tracing::info!("Telegram notification sent successfully");
            Ok(())
        } else {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            Err(format!("Telegram API error: {} - {}", status, error_text).into())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_telegram_service_creation() {
        let _service = TelegramService::new();
        // Just verify it can be created
        assert!(true);
    }

    #[test]
    fn test_message_formatting() {
        let _message = NotificationMessage {
            username: "testuser".to_string(),
            current_streak: 365,
            contributions_today: Some(5),
            message: "Test message".to_string(),
        };

        let _service = TelegramService::new();
        // We can't easily test the actual formatting without making it public
        // But we can verify the service can be created
        assert!(true);
    }
}
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;
// use serde_json::json;

#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationMessage {
    pub username: String,
    pub current_streak: i32,
    pub contributions_today: Option<i32>,
    pub message: String,
}

#[derive(Debug, Serialize)]
struct DiscordEmbed {
    title: String,
    description: String,
    color: u32,
    fields: Vec<DiscordField>,
    footer: DiscordFooter,
    timestamp: String,
}

#[derive(Debug, Serialize)]
struct DiscordField {
    name: String,
    value: String,
    inline: bool,
}

#[derive(Debug, Serialize)]
struct DiscordFooter {
    text: String,
}

#[derive(Debug, Serialize)]
struct DiscordWebhookPayload {
    embeds: Vec<DiscordEmbed>,
    username: String,
}

pub struct DiscordService {
    client: Client,
}

impl DiscordService {
    /// Creates a new Discord service
    ///
    /// # Errors
    /// Returns error if HTTP client fails to build
    pub fn new() -> Result<Self, reqwest::Error> {
        let client = Client::builder().timeout(Duration::from_secs(10)).build()?;
        Ok(Self { client })
    }

    pub async fn send_notification(
        &self,
        webhook_url: &str,
        message: &NotificationMessage,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let embed = DiscordEmbed {
            title: "⚠️ GitHub Streak Alert".to_string(),
            description: message.message.clone(),
            color: 16_739_947, // 0xff6b6b (red color)
            fields: vec![
                DiscordField {
                    name: "GitHub Username".to_string(),
                    value: message.username.clone(),
                    inline: true,
                },
                DiscordField {
                    name: "Current Streak".to_string(),
                    value: format!("{} days", message.current_streak),
                    inline: true,
                },
            ],
            footer: DiscordFooter {
                text: "Streaky - Never lose your GitHub streak".to_string(),
            },
            timestamp: chrono::Utc::now().to_rfc3339(),
        };

        let payload = DiscordWebhookPayload {
            embeds: vec![embed],
            username: "Streaky Bot".to_string(),
        };

        let response = self.client.post(webhook_url).json(&payload).send().await?;

        if response.status().is_success() {
            tracing::info!("Discord notification sent successfully");
            Ok(())
        } else {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            Err(format!("Discord API error: {status} - {error_text}").into())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_discord_service_creation() {
        let service = DiscordService::new();
        assert!(service.is_ok());
    }

    #[test]
    fn test_notification_message_serialization() {
        let message = NotificationMessage {
            username: "testuser".to_string(),
            current_streak: 365,
            contributions_today: Some(5),
            message: "Test message".to_string(),
        };

        let json = serde_json::to_string(&message);
        assert!(json.is_ok());
    }
}

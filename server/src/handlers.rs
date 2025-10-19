use axum::{
    extract::{Request, State},
    http::{HeaderMap, StatusCode},
    response::Json,
    middleware::Next,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::{
    discord::NotificationMessage,
    AppState,
};

#[derive(Debug, Deserialize)]
pub struct NotificationRequest {
    #[serde(rename = "type")]
    pub notification_type: String,
    pub encrypted_webhook: Option<String>,
    pub encrypted_token: Option<String>,
    pub encrypted_chat_id: Option<String>,
    pub message: NotificationMessage,
}

#[derive(Debug, Serialize)]
pub struct NotificationResponse {
    pub success: bool,
    pub error: Option<String>,
}

// Authentication middleware
pub async fn auth_middleware(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
    request: Request,
    next: Next,
) -> Result<axum::response::Response, StatusCode> {
    let api_secret = headers
        .get("X-API-Secret")
        .and_then(|h| h.to_str().ok());

    match api_secret {
        Some(secret) if secret == state.vps_secret => {
            Ok(next.run(request).await)
        }
        _ => {
            tracing::warn!("Unauthorized request: invalid or missing X-API-Secret");
            Err(StatusCode::UNAUTHORIZED)
        }
    }
}

pub async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "healthy",
        "service": "streaky-notification-proxy",
        "version": "0.1.0"
    }))
}

pub async fn send_notification(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<NotificationRequest>,
) -> Result<Json<NotificationResponse>, StatusCode> {
    tracing::info!("Received notification request: type={}", payload.notification_type);

    let result = match payload.notification_type.as_str() {
        "discord" => handle_discord_notification(&state, &payload).await,
        "telegram" => handle_telegram_notification(&state, &payload).await,
        _ => Err("Invalid notification type".into()),
    };

    match result {
        Ok(_) => {
            tracing::info!("Notification sent successfully");
            Ok(Json(NotificationResponse {
                success: true,
                error: None,
            }))
        }
        Err(e) => {
            tracing::error!("Notification failed: {}", e);
            Ok(Json(NotificationResponse {
                success: false,
                error: Some(e.to_string()),
            }))
        }
    }
}

async fn handle_discord_notification(
    state: &AppState,
    payload: &NotificationRequest,
) -> Result<(), Box<dyn std::error::Error>> {
    let encrypted_webhook = payload
        .encrypted_webhook
        .as_ref()
        .ok_or("Missing encrypted_webhook for Discord notification")?;

    // Decrypt webhook URL
    let webhook_url = state.encryption.decrypt(encrypted_webhook)?;

    // Send notification
    state.discord.send_notification(&webhook_url, &payload.message).await?;

    Ok(())
}

async fn handle_telegram_notification(
    state: &AppState,
    payload: &NotificationRequest,
) -> Result<(), Box<dyn std::error::Error>> {
    let encrypted_token = payload
        .encrypted_token
        .as_ref()
        .ok_or("Missing encrypted_token for Telegram notification")?;

    let encrypted_chat_id = payload
        .encrypted_chat_id
        .as_ref()
        .ok_or("Missing encrypted_chat_id for Telegram notification")?;

    // Decrypt credentials
    let bot_token = state.encryption.decrypt(encrypted_token)?;
    let chat_id = state.encryption.decrypt(encrypted_chat_id)?;

    // Send notification
    state.telegram.send_notification(&bot_token, &chat_id, &payload.message).await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_notification_request_deserialization() {
        let json = r#"
        {
            "type": "discord",
            "encrypted_webhook": "test_webhook",
            "message": {
                "username": "testuser",
                "current_streak": 365,
                "contributions_today": 5,
                "message": "Test message"
            }
        }
        "#;

        let request: Result<NotificationRequest, _> = serde_json::from_str(json);
        assert!(request.is_ok());
    }

    #[test]
    fn test_notification_response_serialization() {
        let response = NotificationResponse {
            success: true,
            error: None,
        };

        let json = serde_json::to_string(&response);
        assert!(json.is_ok());
    }
}
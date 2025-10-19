use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm,
};
use base64::{engine::general_purpose, Engine as _};

pub struct EncryptionService {
    cipher: Aes256Gcm,
}

impl EncryptionService {
    pub fn new(key: &str) -> Result<Self, Box<dyn std::error::Error>> {
        // Convert key to 32 bytes for AES-256
        let key_bytes = key.as_bytes();
        if key_bytes.len() != 32 {
            return Err("Encryption key must be exactly 32 bytes".into());
        }

        let key = key_bytes.try_into().map_err(|_| "Invalid key length")?;
        let cipher = Aes256Gcm::new(key);
        Ok(Self { cipher })
    }

    pub fn decrypt(&self, encrypted_data: &str) -> Result<String, Box<dyn std::error::Error>> {
        // Decode from base64
        let encrypted_bytes = general_purpose::STANDARD.decode(encrypted_data)?;

        // Extract IV (first 12 bytes) and ciphertext (rest)
        if encrypted_bytes.len() < 12 {
            return Err("Invalid encrypted data: too short".into());
        }

        let (iv_bytes, ciphertext) = encrypted_bytes.split_at(12);
        let nonce = iv_bytes.try_into().map_err(|_| "Invalid nonce length")?;

        // Decrypt
        let plaintext = self.cipher.decrypt(nonce, ciphertext)
            .map_err(|e| format!("Decryption failed: {:?}", e))?;

        // Convert to string
        let result = String::from_utf8(plaintext)?;
        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encryption_service_creation() {
        let key = "12345678901234567890123456789012"; // 32 bytes
        let service = EncryptionService::new(key);
        assert!(service.is_ok());
    }

    #[test]
    fn test_invalid_key_length() {
        let key = "short"; // Less than 32 bytes
        let service = EncryptionService::new(key);
        assert!(service.is_err());
    }
}
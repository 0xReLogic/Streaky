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
        // Convert key to 32 bytes for AES-256 (take first 32 chars like Worker does)
        let key_str = if key.len() >= 32 {
            &key[0..32]
        } else {
            return Err("Encryption key must be at least 32 characters".into());
        };

        let key_bytes = key_str.as_bytes();
        let key_array: [u8; 32] = key_bytes.try_into().map_err(|_| "Invalid key length")?;
        let cipher = Aes256Gcm::new(&key_array.into());
        Ok(Self { cipher })
    }

    pub fn decrypt(&self, encrypted_data: &str) -> Result<String, Box<dyn std::error::Error>> {
        // Decode from base64 (try STANDARD first, fallback to URL_SAFE if needed)
        let encrypted_bytes = general_purpose::STANDARD
            .decode(encrypted_data)
            .or_else(|_| general_purpose::URL_SAFE.decode(encrypted_data))?;

        // Extract IV (first 12 bytes) and ciphertext (rest)
        if encrypted_bytes.len() < 12 {
            return Err("Invalid encrypted data: too short".into());
        }

        let (iv_bytes, ciphertext) = encrypted_bytes.split_at(12);
        let nonce = iv_bytes.into();

        // Decrypt
        let plaintext = self
            .cipher
            .decrypt(nonce, ciphertext)
            .map_err(|e| format!("Decryption failed: {e:?}"))?;

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

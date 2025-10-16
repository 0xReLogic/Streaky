import { describe, it, expect, beforeEach } from 'vitest';
import { EncryptionService, createEncryptionService } from '../src/services/encryption';

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;
  const testKey = 'test-encryption-key-32-chars!!!!';

  beforeEach(async () => {
    encryptionService = new EncryptionService();
    await encryptionService.initialize(testKey);
  });

  describe('initialize', () => {
    it('should initialize with valid key', async () => {
      const service = new EncryptionService();
      await expect(service.initialize(testKey)).resolves.not.toThrow();
    });

    it('should throw error with short key', async () => {
      const service = new EncryptionService();
      await expect(service.initialize('short')).rejects.toThrow('Encryption key must be at least 32 characters');
    });

    it('should throw error with empty key', async () => {
      const service = new EncryptionService();
      await expect(service.initialize('')).rejects.toThrow('Encryption key must be at least 32 characters');
    });
  });

  describe('encrypt', () => {
    it('should encrypt plaintext successfully', async () => {
      const plaintext = 'Hello, World!';
      const encrypted = await encryptionService.encrypt(plaintext);

      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(plaintext);
      expect(typeof encrypted).toBe('string');
    });

    it('should return empty string for empty input', async () => {
      const encrypted = await encryptionService.encrypt('');
      expect(encrypted).toBe('');
    });

    it('should encrypt Discord webhook URL', async () => {
      const webhookUrl = 'https://discord.com/api/webhooks/123456789/abcdefghijklmnop';
      const encrypted = await encryptionService.encrypt(webhookUrl);

      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(webhookUrl);
    });

    it('should encrypt Telegram token', async () => {
      const token = '123456789:ABCdefGHIjklMNOpqrsTUVwxyz';
      const encrypted = await encryptionService.encrypt(token);

      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(token);
    });

    it('should produce different ciphertext for same plaintext', async () => {
      const plaintext = 'test data';
      const encrypted1 = await encryptionService.encrypt(plaintext);
      const encrypted2 = await encryptionService.encrypt(plaintext);

      // Different IV should produce different ciphertext
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should throw error if not initialized', async () => {
      const uninitializedService = new EncryptionService();
      await expect(uninitializedService.encrypt('test')).rejects.toThrow('Encryption service not initialized');
    });
  });

  describe('decrypt', () => {
    it('should decrypt ciphertext successfully', async () => {
      const plaintext = 'Hello, World!';
      const encrypted = await encryptionService.encrypt(plaintext);
      const decrypted = await encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should return empty string for empty input', async () => {
      const decrypted = await encryptionService.decrypt('');
      expect(decrypted).toBe('');
    });

    it('should decrypt Discord webhook URL', async () => {
      const webhookUrl = 'https://discord.com/api/webhooks/123456789/abcdefghijklmnop';
      const encrypted = await encryptionService.encrypt(webhookUrl);
      const decrypted = await encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(webhookUrl);
    });

    it('should decrypt Telegram token', async () => {
      const token = '123456789:ABCdefGHIjklMNOpqrsTUVwxyz';
      const encrypted = await encryptionService.encrypt(token);
      const decrypted = await encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(token);
    });

    it('should handle long text', async () => {
      const longText = 'a'.repeat(1000);
      const encrypted = await encryptionService.encrypt(longText);
      const decrypted = await encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(longText);
    });

    it('should handle special characters', async () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const encrypted = await encryptionService.encrypt(specialText);
      const decrypted = await encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(specialText);
    });

    it('should handle unicode characters', async () => {
      const unicodeText = '你好世界 🚀 مرحبا';
      const encrypted = await encryptionService.encrypt(unicodeText);
      const decrypted = await encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(unicodeText);
    });

    it('should throw error with invalid ciphertext', async () => {
      await expect(encryptionService.decrypt('invalid-base64')).rejects.toThrow('Decryption failed');
    });

    it('should throw error if not initialized', async () => {
      const uninitializedService = new EncryptionService();
      await expect(uninitializedService.decrypt('test')).rejects.toThrow('Encryption service not initialized');
    });
  });

  describe('encrypt and decrypt round-trip', () => {
    it('should maintain data integrity through multiple operations', async () => {
      const testData = [
        'simple text',
        'https://discord.com/api/webhooks/123/abc',
        '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
        '!@#$%^&*()',
        '你好世界',
        '',
      ];

      for (const data of testData) {
        const encrypted = await encryptionService.encrypt(data);
        const decrypted = await encryptionService.decrypt(encrypted);
        expect(decrypted).toBe(data);
      }
    });
  });

  describe('createEncryptionService', () => {
    it('should create and initialize service', async () => {
      const service = await createEncryptionService(testKey);
      const plaintext = 'test';
      const encrypted = await service.encrypt(plaintext);
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error with invalid key', async () => {
      await expect(createEncryptionService('short')).rejects.toThrow();
    });
  });
});

/**
 * Encryption Service
 * Handles encryption and decryption of sensitive user data using Web Crypto API
 * Algorithm: AES-GCM with 256-bit key
 */

export class EncryptionService {
    private key: CryptoKey | null = null;

    /**
     * Initialize the encryption service with a key
     * @param keyString - Encryption key string (32 characters minimum)
     */
    async initialize(keyString: string): Promise<void> {
        if (!keyString || keyString.length < 32) {
            throw new Error('Encryption key must be at least 32 characters');
        }

        // Convert string key to CryptoKey (use first 32 chars for 256-bit key)
        const keyData = new TextEncoder().encode(keyString.substring(0, 32));
        this.key = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt plaintext data
     * @param plaintext - Data to encrypt
     * @returns Base64 encoded encrypted data with IV prepended
     */
    async encrypt(plaintext: string): Promise<string> {
        if (!this.key) {
            throw new Error('Encryption service not initialized');
        }

        if (!plaintext) {
            return '';
        }

        try {
            // Generate random IV (12 bytes for AES-GCM)
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // Encrypt the data
            const encodedText = new TextEncoder().encode(plaintext);
            const encryptedData = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                this.key,
                encodedText
            );

            // Combine IV and encrypted data
            const combined = new Uint8Array(iv.length + encryptedData.byteLength);
            combined.set(iv, 0);
            combined.set(new Uint8Array(encryptedData), iv.length);

            // Convert to base64
            return this.arrayBufferToBase64(combined);
        } catch (error) {
            throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Decrypt encrypted data
     * @param ciphertext - Base64 encoded encrypted data with IV prepended
     * @returns Decrypted plaintext
     */
    async decrypt(ciphertext: string): Promise<string> {
        if (!this.key) {
            throw new Error('Encryption service not initialized');
        }

        if (!ciphertext) {
            return '';
        }

        try {
            // Decode from base64
            const combined = this.base64ToArrayBuffer(ciphertext);

            // Extract IV and encrypted data
            const iv = combined.slice(0, 12);
            const encryptedData = combined.slice(12);

            // Decrypt the data
            const decryptedData = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                this.key,
                encryptedData
            );

            // Convert to string
            return new TextDecoder().decode(decryptedData);
        } catch (error) {
            throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Convert ArrayBuffer to Base64 string
     */
    private arrayBufferToBase64(buffer: Uint8Array): string {
        let binary = '';
        for (const byte of buffer) {
            binary += String.fromCodePoint(byte);
        }
        return btoa(binary);
    }

    /**
     * Convert Base64 string to ArrayBuffer
     */
    private base64ToArrayBuffer(base64: string): Uint8Array {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.codePointAt(i) || 0;
        }
        return bytes;
    }
}

/**
 * Create and initialize an encryption service instance
 * @param encryptionKey - Encryption key from environment
 */
export async function createEncryptionService(encryptionKey: string): Promise<EncryptionService> {
    const service = new EncryptionService();
    await service.initialize(encryptionKey);
    return service;
}

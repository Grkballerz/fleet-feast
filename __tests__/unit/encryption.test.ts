/**
 * Unit tests for encryption utilities
 * Tests AES-256-GCM encryption, decryption, masking, and validation
 *
 * @jest-environment node
 */

import { encrypt, decrypt, maskString, isEncryptable, isEncrypted, hash } from '@/lib/encryption';

// Mock environment variables
const originalEnv = process.env;

beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters-minimum-length-required';
  process.env.ENCRYPTION_SALT = 'test-salt-for-key-derivation-pbkdf2';
});

afterAll(() => {
  process.env = originalEnv;
});

describe('Encryption Utilities', () => {
  describe('encrypt() and decrypt()', () => {
    it('should encrypt and decrypt a string successfully', () => {
      const plaintext = '1234567890';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for the same plaintext (unique IVs)', () => {
      const plaintext = 'sensitive-data';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      // Should be different due to random IVs
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to the same value
      expect(decrypt(encrypted1)).toBe(plaintext);
      expect(decrypt(encrypted2)).toBe(plaintext);
    });

    it('should handle empty strings', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle special characters and Unicode', () => {
      const plaintext = 'Test !@#$%^&*() 你好 émoji 🔐';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle long strings', () => {
      const plaintext = 'A'.repeat(10000);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error when decrypting invalid format', () => {
      expect(() => decrypt('invalid-data')).toThrow('Failed to decrypt data');
    });

    it('should throw error when decrypting tampered data', () => {
      const plaintext = 'test-data';
      const encrypted = encrypt(plaintext);
      const tampered = encrypted.replace(/:/g, '|'); // Change delimiter

      expect(() => decrypt(tampered)).toThrow();
    });

    it('should throw error when ENCRYPTION_KEY is missing', () => {
      const originalKey = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;

      expect(() => encrypt('test')).toThrow();

      process.env.ENCRYPTION_KEY = originalKey;
    });

    it('should throw error when ENCRYPTION_KEY is too short', () => {
      const originalKey = process.env.ENCRYPTION_KEY;
      process.env.ENCRYPTION_KEY = 'short';

      expect(() => encrypt('test')).toThrow();

      process.env.ENCRYPTION_KEY = originalKey;
    });

    it('should produce correct format (iv:encrypted:authTag)', () => {
      const encrypted = encrypt('test');
      const parts = encrypted.split(':');

      expect(parts).toHaveLength(3);
      expect(parts[0]).toMatch(/^[A-Za-z0-9+/]+=*$/); // Base64 IV
      expect(parts[1]).toMatch(/^[A-Za-z0-9+/]+=*$/); // Base64 encrypted
      expect(parts[2]).toMatch(/^[A-Za-z0-9+/]+=*$/); // Base64 authTag
    });
  });

  describe('maskString()', () => {
    it('should mask string showing last 4 characters by default', () => {
      const result = maskString('1234567890');
      expect(result).toBe('******7890');
    });

    it('should mask string with custom visible characters', () => {
      const result = maskString('1234567890', 2);
      expect(result).toBe('********90');
    });

    it('should mask entire string if shorter than visible chars', () => {
      const result = maskString('123', 4);
      expect(result).toBe('***');
    });

    it('should handle empty string', () => {
      const result = maskString('');
      expect(result).toBe('');
    });

    it('should mask exactly the visible chars', () => {
      const result = maskString('1234', 4);
      // If string length equals visible chars, all are masked
      expect(result).toBe('****');
    });
  });

  describe('hash()', () => {
    it('should produce consistent SHA-256 hash', () => {
      const value = 'test-data';
      const hash1 = hash(value);
      const hash2 = hash(value);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = hash('data1');
      const hash2 = hash('data2');

      expect(hash1).not.toBe(hash2);
    });

    it('should be one-way (cannot decrypt)', () => {
      const value = 'secret';
      const hashed = hash(value);

      // Hash should be irreversible
      expect(hashed).not.toContain(value);
      expect(hashed).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('isEncryptable()', () => {
    it('should return true for valid strings', () => {
      expect(isEncryptable('test')).toBe(true);
      expect(isEncryptable('123')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(isEncryptable('')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isEncryptable(123)).toBe(false);
      expect(isEncryptable(null)).toBe(false);
      expect(isEncryptable(undefined)).toBe(false);
      expect(isEncryptable({})).toBe(false);
      expect(isEncryptable([])).toBe(false);
    });
  });

  describe('isEncrypted()', () => {
    it('should return true for encrypted data', () => {
      const encrypted = encrypt('test-data');
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('should return false for plaintext', () => {
      expect(isEncrypted('plaintext')).toBe(false);
      expect(isEncrypted('test:data:here')).toBe(false); // Wrong format
    });

    it('should return false for invalid format', () => {
      expect(isEncrypted('a:b')).toBe(false); // Only 2 parts
      expect(isEncrypted('a:b:c:d')).toBe(false); // Too many parts
      expect(isEncrypted('')).toBe(false);
    });

    it('should validate IV and auth tag lengths', () => {
      // Create a fake encrypted string with wrong lengths
      const fakeEncrypted = 'abc:def:ghi'; // Too short base64
      expect(isEncrypted(fakeEncrypted)).toBe(false);
    });
  });

  describe('Real-world bank account scenario', () => {
    it('should securely handle bank account numbers', () => {
      const accountNumber = '1234567890123456';

      // Encrypt before storing in database
      const encryptedAccount = encrypt(accountNumber);

      // Verify it's encrypted
      expect(isEncrypted(encryptedAccount)).toBe(true);
      expect(encryptedAccount).not.toContain(accountNumber);

      // Decrypt for processing
      const decryptedAccount = decrypt(encryptedAccount);
      expect(decryptedAccount).toBe(accountNumber);

      // Mask for display
      const maskedAccount = maskString(decryptedAccount, 4);
      expect(maskedAccount).toBe('************3456');
    });

    it('should handle routing numbers', () => {
      const routingNumber = '123456789';
      const encrypted = encrypt(routingNumber);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(routingNumber);
      expect(maskString(decrypted, 4)).toBe('*****6789');
    });
  });
});

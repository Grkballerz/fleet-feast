/**
 * Encryption Utilities for Fleet Feast
 *
 * Provides AES-256-GCM encryption for sensitive data (e.g., bank account numbers)
 * Uses environment variable ENCRYPTION_KEY for the encryption secret
 *
 * Security Features:
 * - AES-256-GCM symmetric encryption
 * - Random initialization vectors (IV) for each encryption
 * - Authentication tags to prevent tampering
 * - Constant-time comparison for decryption validation
 */

import * as crypto from 'crypto';

// Algorithm configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits
const ITERATIONS = 100000;

/**
 * Get encryption key from environment
 * Derives a 256-bit key using PBKDF2
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;

  if (!secret) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  if (secret.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
  }

  // Use a fixed salt for key derivation (stored in env or hardcoded)
  // In production, this could also be stored securely
  const salt = process.env.ENCRYPTION_SALT || 'fleet-feast-encryption-salt-v1';

  return crypto.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt a string value using AES-256-GCM
 *
 * @param plaintext - The string to encrypt
 * @returns Encrypted string in format: iv:encrypted:authTag (base64 encoded)
 *
 * @example
 * const encrypted = encrypt('1234567890');
 * // Returns: "a1b2c3d4...==:e5f6g7h8...==:i9j0k1l2...=="
 */
export function encrypt(plaintext: string): string {
  try {
    // Generate random IV for each encryption
    const iv = crypto.randomBytes(IV_LENGTH);

    // Get encryption key
    const key = getEncryptionKey();

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the plaintext
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Return IV:encrypted:authTag (all base64 encoded)
    return `${iv.toString('base64')}:${encrypted}:${authTag.toString('base64')}`;
  } catch (error) {
    console.error('[Encryption] Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a string value encrypted with AES-256-GCM
 *
 * @param ciphertext - Encrypted string in format: iv:encrypted:authTag
 * @returns Decrypted plaintext string
 *
 * @example
 * const decrypted = decrypt('a1b2c3d4...==:e5f6g7h8...==:i9j0k1l2...==');
 * // Returns: "1234567890"
 */
export function decrypt(ciphertext: string): string {
  try {
    // Split the ciphertext into components
    const parts = ciphertext.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivBase64, encryptedBase64, authTagBase64] = parts;

    // Decode from base64
    const iv = Buffer.from(ivBase64, 'base64');
    const encrypted = Buffer.from(encryptedBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    // Validate lengths
    if (iv.length !== IV_LENGTH) {
      throw new Error('Invalid IV length');
    }

    if (authTag.length !== TAG_LENGTH) {
      throw new Error('Invalid auth tag length');
    }

    // Get encryption key
    const key = getEncryptionKey();

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('[Encryption] Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash a value using SHA-256 (one-way, for verification)
 * Useful for creating searchable hashes of sensitive data
 *
 * @param value - The value to hash
 * @returns SHA-256 hash (hex encoded)
 */
export function hash(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

/**
 * Mask a string, showing only the last N characters
 *
 * @param value - The string to mask
 * @param visibleChars - Number of characters to show at the end (default: 4)
 * @returns Masked string
 *
 * @example
 * maskString('1234567890', 4) // Returns: "******7890"
 */
export function maskString(value: string, visibleChars: number = 4): string {
  if (!value) return '';

  if (value.length <= visibleChars) {
    return '*'.repeat(value.length);
  }

  const maskedLength = value.length - visibleChars;
  const masked = '*'.repeat(maskedLength);
  const visible = value.slice(-visibleChars);

  return masked + visible;
}

/**
 * Validate that a value can be safely encrypted/decrypted
 *
 * @param value - The value to validate
 * @returns true if valid, false otherwise
 */
export function isEncryptable(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Check if a string appears to be encrypted data
 *
 * @param value - The string to check
 * @returns true if it looks like encrypted data
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;

  const parts = value.split(':');

  // Encrypted format is: iv:encrypted:authTag (3 base64 parts)
  if (parts.length !== 3) return false;

  try {
    // Try to decode each part as base64
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[2], 'base64');

    // Check if lengths match expected values
    return iv.length === IV_LENGTH && authTag.length === TAG_LENGTH;
  } catch {
    return false;
  }
}

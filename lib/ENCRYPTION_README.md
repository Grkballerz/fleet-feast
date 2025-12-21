# Encryption Utilities

This module provides secure encryption utilities for Fleet Feast, specifically designed for protecting sensitive financial data like bank account numbers.

## Features

- **AES-256-GCM Encryption**: Industry-standard symmetric encryption
- **Random IVs**: Each encryption uses a unique initialization vector
- **Authentication Tags**: Prevents tampering with encrypted data
- **Key Derivation**: PBKDF2 with 100,000 iterations for secure key generation
- **Masking Utilities**: Safe display of sensitive data

## Setup

### 1. Generate Encryption Key

```bash
# Generate a strong 32-character encryption key
openssl rand -base64 32
```

### 2. Add to Environment Variables

```bash
# .env.local (development)
ENCRYPTION_KEY="your-generated-key-here"

# Optional: custom salt for additional security
ENCRYPTION_SALT="your-custom-salt-here"
```

### 3. Production Deployment

For Vercel:
1. Go to Project Settings → Environment Variables
2. Add `ENCRYPTION_KEY` with your generated key
3. Mark as "Encrypted" and available for Production/Preview/Development
4. **NEVER** commit the actual key to version control

## Usage

### Encrypting Data

```typescript
import { encrypt } from '@/lib/encryption';

const accountNumber = '1234567890123456';
const encrypted = encrypt(accountNumber);
// Returns: "a1b2c3...==:e5f6g7...==:i9j0k1...=="
```

### Decrypting Data

```typescript
import { decrypt } from '@/lib/encryption';

const encryptedData = 'a1b2c3...==:e5f6g7...==:i9j0k1...==';
const decrypted = decrypt(encryptedData);
// Returns: "1234567890123456"
```

### Masking for Display

```typescript
import { maskString } from '@/lib/encryption';

const accountNumber = '1234567890';
const masked = maskString(accountNumber, 4); // Show last 4 digits
// Returns: "******7890"
```

### Validation Helpers

```typescript
import { isEncryptable, isEncrypted } from '@/lib/encryption';

// Check if value can be encrypted
if (isEncryptable(value)) {
  const encrypted = encrypt(value);
}

// Check if value is already encrypted
if (isEncrypted(storedValue)) {
  const decrypted = decrypt(storedValue);
}
```

### One-Way Hashing

```typescript
import { hash } from '@/lib/encryption';

const accountNumber = '1234567890';
const hashed = hash(accountNumber);
// Returns: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"

// Use for creating searchable indexes without storing plaintext
```

## API Endpoint Example

### Bank Account Management

```typescript
// POST /api/vendor/bank-account
import { encrypt, decrypt, maskString } from '@/lib/encryption';

// Store encrypted
const encryptedAccount = encrypt(data.bankAccountNumber);
await prisma.vendor.update({
  data: { bankAccountNumber: encryptedAccount }
});

// Retrieve and mask
const vendor = await prisma.vendor.findUnique({ where: { id } });
const decrypted = decrypt(vendor.bankAccountNumber);
const masked = maskString(decrypted, 4);

return { accountNumberMasked: masked }; // "******7890"
```

## Security Best Practices

### DO ✅

- Generate a strong random key (32+ characters)
- Store the key in environment variables only
- Use different keys for development/staging/production
- Rotate keys periodically (requires data migration)
- Encrypt before storing in database
- Mask when displaying to users
- Log encryption/decryption failures (without sensitive data)
- Use HTTPS in production for data in transit

### DON'T ❌

- Commit encryption keys to version control
- Hardcode keys in source code
- Use weak or predictable keys
- Store plaintext alongside encrypted data
- Log decrypted sensitive data
- Return full account numbers in API responses
- Reuse IVs (this is handled automatically)

## Database Storage

The encrypted data format is:

```
iv:encrypted:authTag
```

All parts are base64-encoded. Example:

```
rBmTCZetkn8VLfEDQqW2Zw==:5xY8pQqM...==:kL9mN3oP...==
```

Store this as a `String` in your database schema:

```prisma
model Vendor {
  bankAccountNumber String? // Stores encrypted format
}
```

## Error Handling

```typescript
import { encrypt, decrypt } from '@/lib/encryption';

try {
  const encrypted = encrypt(plaintext);
  await saveToDB(encrypted);
} catch (error) {
  console.error('[Encryption] Failed:', error);
  // DO NOT log the plaintext value
  return { error: 'Failed to secure data' };
}

try {
  const decrypted = decrypt(ciphertext);
  return decrypted;
} catch (error) {
  console.error('[Decryption] Failed:', error);
  // DO NOT log the ciphertext (could expose key issues)
  return { error: 'Failed to retrieve data' };
}
```

## Testing

```bash
# Run encryption tests
npm test __tests__/lib/encryption.test.ts
```

## Key Rotation

If you need to rotate the encryption key:

1. Generate a new key
2. Create a migration script:

```typescript
// scripts/rotate-encryption-key.ts
import { encrypt, decrypt } from '@/lib/encryption';

const OLD_KEY = process.env.OLD_ENCRYPTION_KEY;
const NEW_KEY = process.env.ENCRYPTION_KEY;

async function rotateKeys() {
  const vendors = await prisma.vendor.findMany({
    where: { bankAccountNumber: { not: null } }
  });

  for (const vendor of vendors) {
    // Decrypt with old key
    process.env.ENCRYPTION_KEY = OLD_KEY;
    const decrypted = decrypt(vendor.bankAccountNumber);

    // Re-encrypt with new key
    process.env.ENCRYPTION_KEY = NEW_KEY;
    const reencrypted = encrypt(decrypted);

    // Update database
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { bankAccountNumber: reencrypted }
    });
  }
}
```

## Algorithm Details

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits (32 bytes)
- **IV Size**: 128 bits (16 bytes) - randomly generated per encryption
- **Auth Tag**: 128 bits (16 bytes) - prevents tampering
- **Key Derivation**: PBKDF2-SHA256 with 100,000 iterations

## Compliance

This encryption implementation follows:

- **PCI DSS**: Suitable for encrypting cardholder data at rest
- **GDPR**: Protects personal financial information
- **SOC 2**: Meets encryption requirements for sensitive data

## Support

For questions or issues:
1. Check the test file: `__tests__/lib/encryption.test.ts`
2. Review the implementation: `lib/encryption.ts`
3. See API usage: `app/api/vendor/bank-account/route.ts`

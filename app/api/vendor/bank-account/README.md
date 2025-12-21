# Vendor Bank Account API

API endpoints for managing vendor bank account information with encryption and security.

## Endpoints

### GET /api/vendor/bank-account

Retrieve the authenticated vendor's bank account information (masked).

**Authentication:** Required (VENDOR role)

**Response:**
```json
{
  "data": {
    "bankAccount": {
      "bankAccountHolder": "John Doe",
      "bankAccountNumberMasked": "******7890",
      "bankRoutingNumber": "123456789",
      "bankAccountType": "CHECKING",
      "bankName": "Chase Bank",
      "payoutMethod": "ACH",
      "bankVerified": false,
      "bankVerifiedAt": null
    }
  }
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a vendor
- `404 Not Found`: Vendor profile not found
- `500 Internal Server Error`: Server error

---

### POST /api/vendor/bank-account

Add or update bank account information for the authenticated vendor.

**Authentication:** Required (VENDOR role)

**Request Body:**
```json
{
  "bankAccountHolder": "John Doe",
  "bankAccountNumber": "1234567890",
  "bankRoutingNumber": "123456789",
  "bankAccountType": "CHECKING",
  "bankName": "Chase Bank",
  "payoutMethod": "ACH"
}
```

**Field Constraints:**
- `bankAccountHolder`: 2-100 characters
- `bankAccountNumber`: 8-17 characters (encrypted before storage)
- `bankRoutingNumber`: Exactly 9 digits
- `bankAccountType`: "CHECKING" or "SAVINGS"
- `bankName`: 2-100 characters
- `payoutMethod`: "ACH", "EFT", or "WIRE" (optional, defaults to "ACH")

**Response:**
```json
{
  "data": {
    "message": "Bank account added successfully",
    "bankAccount": {
      "bankAccountHolder": "John Doe",
      "bankAccountNumberMasked": "******7890",
      "bankRoutingNumber": "123456789",
      "bankAccountType": "CHECKING",
      "bankName": "Chase Bank",
      "payoutMethod": "ACH",
      "bankVerified": false
    }
  }
}
```

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a vendor
- `404 Not Found`: Vendor profile not found
- `500 Internal Server Error`: Server error

**Validation Errors:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": {
        "bankRoutingNumber": ["Routing number must be 9 digits"],
        "bankAccountNumber": ["String must contain at least 8 character(s)"]
      }
    }
  }
}
```

---

### DELETE /api/vendor/bank-account

Remove bank account information for the authenticated vendor.

**Authentication:** Required (VENDOR role)

**Response:**
```json
{
  "data": {
    "message": "Bank account removed successfully"
  }
}
```

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: No bank account to delete
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a vendor
- `404 Not Found`: Vendor profile not found
- `500 Internal Server Error`: Server error

---

## Security Features

### Encryption

All bank account numbers are encrypted using **AES-256-GCM** before being stored in the database:

- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2-SHA256 with 100,000 iterations
- **IV**: 128-bit random initialization vector (unique per encryption)
- **Auth Tag**: 128-bit authentication tag prevents tampering

### Data Masking

When retrieving bank account information, the account number is:
1. Decrypted from storage
2. Masked to show only the last 4 digits
3. Returned as `bankAccountNumberMasked: "******7890"`

The full account number is **never** returned in API responses.

### Audit Logging

All bank account changes are logged with:
- User ID
- Action (ADD, UPDATE, DELETE)
- Timestamp
- Metadata (without sensitive data)

Logs are written to console in development and should be sent to a centralized logging service in production.

### Verification Reset

When bank account details are changed, the `bankVerified` flag is automatically reset to `false` to ensure the new account is re-verified before payouts.

---

## Implementation Details

### Database Schema

```prisma
model Vendor {
  // ...
  bankAccountHolder String?
  bankAccountNumber String?  // Encrypted format: "iv:encrypted:authTag"
  bankRoutingNumber String?
  bankAccountType   BankAccountType?
  bankName          String?
  payoutMethod      PayoutMethod?
  bankVerified      Boolean @default(false)
  bankVerifiedAt    DateTime?
}
```

### Encrypted Format

Encrypted data is stored as a base64-encoded string:
```
iv:encrypted:authTag
```

Example:
```
rBmTCZetkn8VLfEDQqW2Zw==:5xY8pQqMnR3sT7uV...==:kL9mN3oPqR2sTuV...==
```

### Environment Variables

Required:
```bash
ENCRYPTION_KEY="your-32-char-or-longer-key"
```

Optional:
```bash
ENCRYPTION_SALT="your-custom-salt"
```

See `.env.example` for setup instructions.

---

## Testing

### Manual Testing with cURL

**Add bank account:**
```bash
curl -X POST http://localhost:3000/api/vendor/bank-account \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "bankAccountHolder": "John Doe",
    "bankAccountNumber": "1234567890",
    "bankRoutingNumber": "123456789",
    "bankAccountType": "CHECKING",
    "bankName": "Chase Bank",
    "payoutMethod": "ACH"
  }'
```

**Get bank account:**
```bash
curl http://localhost:3000/api/vendor/bank-account \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Delete bank account:**
```bash
curl -X DELETE http://localhost:3000/api/vendor/bank-account \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Unit Tests

Encryption utilities are tested in `__tests__/unit/encryption.test.ts`:

```bash
npm test __tests__/unit/encryption.test.ts
```

Coverage:
- ✅ Encryption/decryption
- ✅ Unique IVs per encryption
- ✅ Special characters and Unicode
- ✅ Error handling
- ✅ Data masking
- ✅ Validation

---

## Error Handling

### Common Errors

**Missing ENCRYPTION_KEY:**
```
Error: ENCRYPTION_KEY environment variable is not set
```
Solution: Add `ENCRYPTION_KEY` to your `.env.local` file.

**Short ENCRYPTION_KEY:**
```
Error: ENCRYPTION_KEY must be at least 32 characters long
```
Solution: Generate a longer key using `openssl rand -base64 32`.

**Decryption Failure:**
```
Error: Failed to decrypt data
```
Possible causes:
- Encryption key changed
- Database data corrupted
- Wrong encryption algorithm

**Validation Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": {
        "bankRoutingNumber": ["Routing number must be 9 digits"]
      }
    }
  }
}
```
Solution: Check input format and try again.

---

## Integration with Vendor Profile

The bank account API is part of the vendor profile workflow:

1. Vendor applies → Application approved
2. Vendor adds bank account → `POST /api/vendor/bank-account`
3. Admin verifies account (future feature) → Set `bankVerified: true`
4. Vendor receives payouts → Uses verified bank account

---

## Security Best Practices

### For Developers

✅ **DO:**
- Use environment variables for encryption key
- Mask account numbers in responses
- Log changes (without sensitive data)
- Validate input data
- Use HTTPS in production

❌ **DON'T:**
- Commit encryption keys to git
- Log decrypted account numbers
- Return full account numbers in API
- Skip validation
- Use weak encryption keys

### For Production

1. **Environment Variables**: Store in Vercel/AWS Secrets Manager
2. **Key Rotation**: Plan for periodic key rotation
3. **Audit Logs**: Send to centralized logging (Datadog, CloudWatch)
4. **Monitoring**: Alert on failed decryption attempts
5. **Compliance**: Ensure PCI DSS compliance for financial data

---

## Future Enhancements

- [ ] Bank account verification via micro-deposits
- [ ] Plaid integration for instant verification
- [ ] Support for international bank accounts (IBAN, SWIFT)
- [ ] Multi-account support per vendor
- [ ] Automated payout scheduling
- [ ] Bank account change notifications via email

---

## Support

For issues or questions:
- Check encryption docs: `lib/ENCRYPTION_README.md`
- Review test examples: `__tests__/unit/encryption.test.ts`
- See vendor service: `modules/vendor/vendor.service.ts`

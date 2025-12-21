/**
 * Vendor Bank Account Management API
 *
 * POST /api/vendor/bank-account - Add or update bank account information
 * GET /api/vendor/bank-account - Retrieve bank account information (masked)
 * DELETE /api/vendor/bank-account - Remove bank account information
 *
 * Security:
 * - Requires VENDOR role authentication
 * - Account numbers are encrypted using AES-256-GCM before storage
 * - GET endpoint returns masked account numbers (last 4 digits only)
 * - All changes are audit logged
 *
 * @author Ellis_Endpoints
 * @date 2025-12-20
 */

import { NextResponse } from "next/server";
import { requireVendor, getUserId, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, maskString } from "@/lib/encryption";
import { z } from "zod";

/**
 * Validation schema for bank account data
 */
const bankAccountSchema = z.object({
  bankAccountHolder: z.string().min(2).max(100),
  bankAccountNumber: z.string().min(8).max(17), // Account numbers typically 8-17 digits
  bankRoutingNumber: z.string().regex(/^\d{9}$/, "Routing number must be 9 digits"),
  bankAccountType: z.enum(["CHECKING", "SAVINGS"]),
  bankName: z.string().min(2).max(100),
  payoutMethod: z.enum(["ACH", "EFT", "WIRE"]).optional().default("ACH"),
});

type BankAccountInput = z.infer<typeof bankAccountSchema>;

/**
 * Audit log helper for bank account changes
 */
async function auditLog(
  userId: string,
  action: 'ADD' | 'UPDATE' | 'DELETE',
  details: Record<string, any>
) {
  console.log('[Bank Account Audit]', {
    userId,
    action,
    timestamp: new Date().toISOString(),
    details: {
      ...details,
      // Never log sensitive data
      bankAccountNumber: details.bankAccountNumber ? '[REDACTED]' : undefined,
    },
  });

  // TODO: In production, write to audit log table or external logging service
  // await prisma.auditLog.create({
  //   data: {
  //     userId,
  //     action: `BANK_ACCOUNT_${action}`,
  //     metadata: details,
  //   },
  // });
}

/**
 * GET /api/vendor/bank-account
 * Retrieve vendor's bank account information (masked)
 */
async function handleGET(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);

    // Find vendor profile
    const vendor = await prisma.vendor.findUnique({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        bankAccountHolder: true,
        bankAccountNumber: true,
        bankRoutingNumber: true,
        bankAccountType: true,
        bankName: true,
        payoutMethod: true,
        bankVerified: true,
        bankVerifiedAt: true,
      },
    });

    if (!vendor) {
      return ApiResponses.notFound('Vendor profile');
    }

    // Return null if no bank account is set
    if (!vendor.bankAccountNumber) {
      return ApiResponses.ok({
        bankAccount: null,
      });
    }

    // Decrypt account number and mask it
    let maskedAccountNumber: string;
    try {
      const decryptedAccountNumber = decrypt(vendor.bankAccountNumber);
      maskedAccountNumber = maskString(decryptedAccountNumber, 4);
    } catch (error) {
      console.error('[Bank Account] Failed to decrypt account number:', error);
      return ApiResponses.internalError('Failed to retrieve bank account information');
    }

    // Return masked bank account info
    return ApiResponses.ok({
      bankAccount: {
        bankAccountHolder: vendor.bankAccountHolder,
        bankAccountNumberMasked: maskedAccountNumber,
        bankRoutingNumber: vendor.bankRoutingNumber,
        bankAccountType: vendor.bankAccountType,
        bankName: vendor.bankName,
        payoutMethod: vendor.payoutMethod,
        bankVerified: vendor.bankVerified,
        bankVerifiedAt: vendor.bankVerifiedAt,
      },
    });
  } catch (error) {
    console.error('[Bank Account] GET Error:', error);
    return ApiResponses.internalError('Failed to retrieve bank account information');
  }
}

/**
 * POST /api/vendor/bank-account
 * Add or update vendor's bank account information
 */
async function handlePOST(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);

    // Parse and validate request body
    const body = await req.json();
    const validationResult = bankAccountSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const data = validationResult.data;

    // Find vendor profile
    const vendor = await prisma.vendor.findUnique({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        bankAccountNumber: true,
      },
    });

    if (!vendor) {
      return ApiResponses.notFound('Vendor profile');
    }

    // Encrypt the account number
    let encryptedAccountNumber: string;
    try {
      encryptedAccountNumber = encrypt(data.bankAccountNumber);
    } catch (error) {
      console.error('[Bank Account] Encryption failed:', error);
      return ApiResponses.internalError('Failed to secure bank account information');
    }

    // Determine if this is an add or update
    const isUpdate = !!vendor.bankAccountNumber;
    const action = isUpdate ? 'UPDATE' : 'ADD';

    // Update vendor with encrypted bank account data
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        bankAccountHolder: data.bankAccountHolder,
        bankAccountNumber: encryptedAccountNumber,
        bankRoutingNumber: data.bankRoutingNumber,
        bankAccountType: data.bankAccountType,
        bankName: data.bankName,
        payoutMethod: data.payoutMethod,
        // Reset verification when bank account is changed
        bankVerified: false,
        bankVerifiedAt: null,
      },
      select: {
        bankAccountHolder: true,
        bankAccountNumber: true,
        bankRoutingNumber: true,
        bankAccountType: true,
        bankName: true,
        payoutMethod: true,
        bankVerified: true,
      },
    });

    // Audit log
    await auditLog(userId, action, {
      bankAccountHolder: data.bankAccountHolder,
      bankAccountType: data.bankAccountType,
      bankName: data.bankName,
      payoutMethod: data.payoutMethod,
    });

    // Decrypt and mask for response
    let maskedAccountNumber: string;
    try {
      const decryptedAccountNumber = decrypt(updatedVendor.bankAccountNumber!);
      maskedAccountNumber = maskString(decryptedAccountNumber, 4);
    } catch (error) {
      console.error('[Bank Account] Failed to decrypt for response:', error);
      // Still return success, but without masked number
      maskedAccountNumber = '****';
    }

    return ApiResponses.ok({
      message: isUpdate
        ? 'Bank account updated successfully'
        : 'Bank account added successfully',
      bankAccount: {
        bankAccountHolder: updatedVendor.bankAccountHolder,
        bankAccountNumberMasked: maskedAccountNumber,
        bankRoutingNumber: updatedVendor.bankRoutingNumber,
        bankAccountType: updatedVendor.bankAccountType,
        bankName: updatedVendor.bankName,
        payoutMethod: updatedVendor.payoutMethod,
        bankVerified: updatedVendor.bankVerified,
      },
    });
  } catch (error) {
    console.error('[Bank Account] POST Error:', error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return ApiResponses.conflict('Bank account already exists');
      }
    }

    return ApiResponses.internalError('Failed to save bank account information');
  }
}

/**
 * DELETE /api/vendor/bank-account
 * Remove vendor's bank account information
 */
async function handleDELETE(req: AuthenticatedRequest) {
  try {
    const userId = getUserId(req);

    // Find vendor profile
    const vendor = await prisma.vendor.findUnique({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        bankAccountNumber: true,
      },
    });

    if (!vendor) {
      return ApiResponses.notFound('Vendor profile');
    }

    // Check if bank account exists
    if (!vendor.bankAccountNumber) {
      return ApiResponses.badRequest('No bank account to delete');
    }

    // Remove bank account data
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        bankAccountHolder: null,
        bankAccountNumber: null,
        bankRoutingNumber: null,
        bankAccountType: null,
        bankName: null,
        payoutMethod: null,
        bankVerified: false,
        bankVerifiedAt: null,
      },
    });

    // Audit log
    await auditLog(userId, 'DELETE', {
      vendorId: vendor.id,
    });

    return ApiResponses.ok({
      message: 'Bank account removed successfully',
    });
  } catch (error) {
    console.error('[Bank Account] DELETE Error:', error);
    return ApiResponses.internalError('Failed to remove bank account information');
  }
}

// Export handlers with vendor authentication middleware
export const GET = requireVendor(handleGET);
export const POST = requireVendor(handlePOST);
export const DELETE = requireVendor(handleDELETE);

/**
 * Vendor Document Upload API
 * POST /api/vendor/documents - Upload document
 * GET /api/vendor/documents - Get vendor's documents
 *
 * Requires VENDOR role
 */

import { NextResponse } from "next/server";
import { requireVendor, getUserId, type AuthenticatedRequest } from "@/lib/middleware/auth.middleware";
import { ApiResponses } from "@/lib/api-response";
import { documentUploadSchema } from "@/modules/vendor/vendor.validation";
import { uploadVendorDocument, getVendorDocuments, VendorError } from "@/modules/vendor/vendor.service";
import { uploadFile, validateFile, ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE } from "@/lib/storage";

/**
 * Handle POST request for document upload
 */
async function handlePOST(req: AuthenticatedRequest) {
  try {
    // Get authenticated user ID
    const userId = getUserId(req);

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("type") as string | null;

    if (!file) {
      return ApiResponses.badRequest("File is required");
    }

    if (!documentType) {
      return ApiResponses.badRequest("Document type is required");
    }

    // Validate file
    const fileValidation = validateFile(file, {
      maxSize: MAX_DOCUMENT_SIZE,
      allowedTypes: ALLOWED_DOCUMENT_TYPES,
    });

    if (!fileValidation.valid) {
      return ApiResponses.badRequest(fileValidation.error!);
    }

    // Upload file to storage
    const fileUrl = await uploadFile(file, `vendor-documents/${documentType.toLowerCase()}`);

    // Validate document data with Zod
    const validationResult = documentUploadSchema.safeParse({
      type: documentType,
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
    });

    if (!validationResult.success) {
      return ApiResponses.validationError(
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    // Save document metadata
    const result = await uploadVendorDocument(userId, validationResult.data);

    return ApiResponses.created({
      documentId: result.documentId,
      type: result.type,
      fileName: file.name,
      fileUrl,
      message: "Document uploaded successfully",
    });
  } catch (error) {
    console.error("[Vendor Documents] Upload Error:", error);

    // Handle custom vendor errors
    if (error instanceof VendorError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    // Handle unexpected errors
    return ApiResponses.internalError("Failed to upload document");
  }
}

/**
 * Handle GET request to fetch vendor's documents
 */
async function handleGET(req: AuthenticatedRequest) {
  try {
    // Get authenticated user ID
    const userId = getUserId(req);

    // Get vendor by user ID first
    const { prisma } = await import("@/lib/prisma");
    const vendor = await prisma.vendor.findUnique({
      where: { userId, deletedAt: null },
      select: { id: true },
    });

    if (!vendor) {
      return ApiResponses.notFound("Vendor application");
    }

    // Get documents
    const documents = await getVendorDocuments(vendor.id);

    return ApiResponses.ok({
      documents: documents.map((doc) => ({
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        verified: doc.verified,
        verifiedAt: doc.verifiedAt,
        createdAt: doc.createdAt,
      })),
    });
  } catch (error) {
    console.error("[Vendor Documents] Get Error:", error);

    // Handle unexpected errors
    return ApiResponses.internalError("Failed to fetch documents");
  }
}

// Export with authentication middleware (requires VENDOR role)
export const POST = requireVendor(handlePOST);
export const GET = requireVendor(handleGET);

/**
 * File Storage Utility
 * Placeholder for S3/Cloudinary file upload integration
 *
 * TODO: Implement actual cloud storage integration
 * Options:
 * - AWS S3 with @aws-sdk/client-s3
 * - Cloudinary with cloudinary package
 * - Vercel Blob with @vercel/blob
 *
 * For now, returns placeholder URLs
 */

/**
 * Upload file to cloud storage
 * @param file - File to upload (File or Blob)
 * @param path - Storage path (e.g., "vendor-documents/business-license")
 * @returns Promise<string> - URL of uploaded file
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  // TODO: Implement actual S3/Cloudinary upload
  // Example with S3:
  /*
  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const key = `${path}/${Date.now()}-${file.name}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
  }));

  return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;
  */

  // Placeholder implementation
  console.warn("[STORAGE] Using placeholder URL - implement actual cloud storage");
  return `https://storage.placeholder.com/${path}/${file.name}`;
}

/**
 * Delete file from cloud storage
 * @param fileUrl - URL of file to delete
 * @returns Promise<void>
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  // TODO: Implement actual S3/Cloudinary deletion
  // Example with S3:
  /*
  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const key = extractKeyFromUrl(fileUrl);

  await s3Client.send(new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  }));
  */

  console.warn("[STORAGE] Placeholder delete - implement actual cloud storage");
}

/**
 * Get signed URL for temporary file access
 * @param fileUrl - URL of file
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Promise<string> - Signed URL
 */
export async function getSignedUrl(
  fileUrl: string,
  expiresIn: number = 3600
): Promise<string> {
  // TODO: Implement actual signed URL generation
  // Example with S3:
  /*
  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const key = extractKeyFromUrl(fileUrl);

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
  */

  console.warn("[STORAGE] Using original URL - implement signed URL generation");
  return fileUrl;
}

/**
 * Validate file type and size
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[]; // MIME types
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes } = options; // Default 10MB

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${Math.round(maxSize / (1024 * 1024))}MB`,
    };
  }

  // Check file type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Allowed document MIME types for vendor documents
 */
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/**
 * Maximum file size for vendor documents (10MB)
 */
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

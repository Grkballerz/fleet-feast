# File Storage Setup

**Project**: Fleet Feast
**Storage**: AWS S3 or Cloudinary
**Last Updated**: 2025-12-04

---

## Table of Contents

1. [Overview](#overview)
2. [Storage Options](#storage-options)
3. [AWS S3 Setup (Recommended)](#aws-s3-setup-recommended)
4. [Cloudinary Setup (Alternative)](#cloudinary-setup-alternative)
5. [Upload Flow](#upload-flow)
6. [File Types and Limits](#file-types-and-limits)
7. [Image Optimization](#image-optimization)
8. [Security](#security)
9. [CDN Integration](#cdn-integration)
10. [Backup and Retention](#backup-and-retention)
11. [Monitoring](#monitoring)
12. [Troubleshooting](#troubleshooting)

---

## Overview

Fleet Feast requires file storage for:
- **Vendor Images**: Profile photos, food photos (JPEG, PNG, WebP)
- **Documents**: Licenses, permits, insurance (PDF, DOC)
- **Menu PDFs**: Downloadable vendor menus (PDF)
- **User Avatars**: Profile pictures (JPEG, PNG)

**Requirements**:
- Secure uploads (authenticated users only)
- Fast delivery (CDN)
- Image transformations (resize, compress, format conversion)
- Max file size: 10MB
- Total storage: 10GB-100GB (MVP to production)

---

## Storage Options

### Option 1: AWS S3 (Recommended)

**Pros**:
- ✅ **Cost-Effective**: $0.023/GB/month (first 50TB)
- ✅ **Scalable**: Unlimited storage
- ✅ **Durable**: 99.999999999% durability (11 nines)
- ✅ **Secure**: IAM policies, presigned URLs, encryption
- ✅ **CDN Integration**: Works with CloudFront
- ✅ **Flexible**: Any file type, no limits

**Cons**:
- ❌ **No Image Processing**: Requires external service (Sharp, imgproxy)
- ❌ **Complex Setup**: IAM users, bucket policies, CORS

**Pricing**:
- **Storage**: $0.023/GB/month (~$0.23/month for 10GB)
- **Bandwidth**: $0.09/GB transfer out (~$0.90/month for 10GB)
- **Requests**: $0.005 per 10,000 PUT requests

**Best for**: Full control, cost optimization, existing AWS infrastructure

### Option 2: Cloudinary (Alternative)

**Pros**:
- ✅ **Built-In Image Transformations**: Resize, crop, format conversion
- ✅ **Automatic Optimization**: WebP conversion, responsive images
- ✅ **CDN Included**: Global delivery
- ✅ **Simple API**: Upload and transform in one call
- ✅ **Free Tier**: 25GB storage, 25GB bandwidth/month

**Cons**:
- ❌ **Higher Cost**: $99/month for 100GB (vs $2.30 for S3)
- ❌ **Vendor Lock-In**: Harder to migrate away
- ❌ **Limited Control**: Can't customize transformation pipeline

**Pricing**:
- **Free Tier**: 25GB storage, 25GB bandwidth
- **Plus Plan**: $99/month for 100GB storage, 150GB bandwidth
- **Advanced Plan**: $249/month for 500GB

**Best for**: Rapid development, image-heavy apps, less backend complexity

---

## AWS S3 Setup (Recommended)

### Step 1: Create S3 Bucket

1. Sign in to [AWS Console](https://console.aws.amazon.com/s3)
2. Click **Create Bucket**

**Configuration**:
- **Bucket Name**: `fleet-feast-production` (must be globally unique)
- **Region**: `us-east-1` (closest to Vercel)
- **Block Public Access**: **Uncheck** "Block all public access"
  - Check: "Block public access to buckets and objects granted through new access control lists (ACLs)"
  - Check: "Block public access to buckets and objects granted through any access control lists (ACLs)"
  - **Uncheck**: "Block public access to buckets and objects granted through new public bucket or access point policies"
  - **Uncheck**: "Block public and cross-account access to buckets and objects through any public bucket or access point policies"
- **Bucket Versioning**: Enable (for recovery)
- **Encryption**: Enable (SSE-S3)
- **Object Lock**: Disable

### Step 2: Configure Bucket Policy

1. Go to **Permissions** → **Bucket Policy**
2. Add the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::fleet-feast-production/public/*"
    }
  ]
}
```

This allows public read access to files in the `public/` folder only.

### Step 3: Configure CORS

1. Go to **Permissions** → **CORS**
2. Add the following configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "https://fleetfeast.com",
      "https://*.vercel.app",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Step 4: Create IAM User

1. Go to **IAM** → **Users** → **Create User**
2. User name: `fleet-feast-s3-uploader`
3. **Permissions**: Attach policies directly → Create inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::fleet-feast-production",
        "arn:aws:s3:::fleet-feast-production/*"
      ]
    }
  ]
}
```

4. Create **Access Key**:
   - Go to **Security Credentials** → **Create Access Key**
   - Use case: **Application running outside AWS**
   - Save `Access Key ID` and `Secret Access Key` (shown only once)

### Step 5: Add Environment Variables

```bash
# Add to Vercel
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add AWS_S3_BUCKET production
vercel env add AWS_S3_REGION production
```

Values:
```
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=fleet-feast-production
AWS_S3_REGION=us-east-1
```

### Step 6: Install AWS SDK

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Step 7: Create Upload Service

```typescript
// lib/services/upload.service.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFile(
  file: File,
  folder: 'documents' | 'images',
  userId: string
): Promise<string> {
  const key = `${folder}/${userId}/${Date.now()}-${file.name}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
  });

  await s3Client.send(command);

  return key;
}

export async function getSignedUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
}
```

---

## Cloudinary Setup (Alternative)

### Step 1: Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up for free tier
3. Verify email

### Step 2: Get API Credentials

1. Go to **Dashboard**
2. Copy credentials:
   - **Cloud Name**: `your-cloud-name`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz123456`

### Step 3: Add Environment Variables

```bash
vercel env add CLOUDINARY_CLOUD_NAME production
vercel env add CLOUDINARY_API_KEY production
vercel env add CLOUDINARY_API_SECRET production
```

### Step 4: Install Cloudinary SDK

```bash
npm install cloudinary
```

### Step 5: Create Upload Service

```typescript
// lib/services/cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadImage(
  file: File,
  folder: string
): Promise<{ url: string; publicId: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `fleet-feast/${folder}`,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export function getTransformedUrl(publicId: string, width: number, height: number): string {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  });
}
```

---

## Upload Flow

### Option 1: Direct Upload (Client → S3)

**Best for**: Large files, faster uploads

1. Client requests presigned URL from server
2. Server generates presigned URL (60s expiry)
3. Client uploads file directly to S3 using presigned URL
4. Client sends S3 key to server to save in database

```typescript
// app/api/upload/presigned/route.ts
import { getServerSession } from 'next-auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { fileName, fileType, folder } = await req.json();

  const key = `${folder}/${session.user.id}/${Date.now()}-${fileName}`;

  const s3Client = new S3Client({ region: process.env.AWS_S3_REGION! });

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: fileType,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

  return Response.json({ presignedUrl, key });
}

// app/api/upload/confirm/route.ts
export async function POST(req: Request) {
  const { key, resourceType } = await req.json();

  // Save to database
  await prisma.upload.create({
    data: {
      key,
      userId: session.user.id,
      resourceType,
    },
  });

  return Response.json({ success: true });
}
```

### Option 2: Server Upload (Client → Server → S3)

**Best for**: Small files, server-side validation

```typescript
// app/api/upload/route.ts
import { uploadFile } from '@/lib/services/upload.service';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file size
  if (file.size > 10 * 1024 * 1024) { // 10MB
    return Response.json({ error: 'File too large' }, { status: 413 });
  }

  // Upload to S3
  const key = await uploadFile(file, 'images', session.user.id);

  // Save to database
  await prisma.upload.create({
    data: { key, userId: session.user.id },
  });

  return Response.json({ key, url: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}` });
}
```

---

## File Types and Limits

### Allowed File Types

```typescript
// lib/utils/file-validation.ts
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

export function validateFileType(file: File, category: 'images' | 'documents'): boolean {
  return ALLOWED_FILE_TYPES[category].includes(file.type);
}
```

### File Size Limits

```typescript
export const MAX_FILE_SIZE = {
  images: 10 * 1024 * 1024,      // 10MB
  documents: 5 * 1024 * 1024,    // 5MB
  avatars: 2 * 1024 * 1024,      // 2MB
};

export function validateFileSize(file: File, category: keyof typeof MAX_FILE_SIZE): boolean {
  return file.size <= MAX_FILE_SIZE[category];
}
```

---

## Image Optimization

### Using Sharp (Server-Side)

```bash
npm install sharp
```

```typescript
// lib/utils/image.ts
import sharp from 'sharp';

export async function optimizeImage(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}
```

### Using Next.js Image Component

```typescript
import Image from 'next/image';

// Automatic optimization
<Image
  src={`https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`}
  width={400}
  height={300}
  alt="Vendor photo"
  loading="lazy"
/>
```

---

## Security

### Presigned URLs (Temporary Access)

```typescript
export async function getSecureUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
}
```

### File Access Control

```typescript
// Only owner can access their documents
export async function canAccessFile(userId: string, fileKey: string): Promise<boolean> {
  const upload = await prisma.upload.findFirst({
    where: { key: fileKey, userId },
  });

  return !!upload;
}

// API route protection
export async function GET(req: Request) {
  const { key } = await req.json();
  const session = await getServerSession();

  if (!await canAccessFile(session.user.id, key)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = await getSecureUrl(key);
  return Response.json({ url });
}
```

---

## CDN Integration

### AWS CloudFront

1. Go to [CloudFront Console](https://console.aws.amazon.com/cloudfront)
2. **Create Distribution**:
   - **Origin Domain**: `fleet-feast-production.s3.us-east-1.amazonaws.com`
   - **Origin Path**: Leave empty
   - **Viewer Protocol Policy**: Redirect HTTP to HTTPS
   - **Cache Policy**: CachingOptimized
   - **Price Class**: Use Only North America and Europe (cheaper)

3. Update S3 bucket policy to allow CloudFront access

4. Use CloudFront URL in app:
   ```
   https://d1234567890abc.cloudfront.net/images/vendor-photo.jpg
   ```

---

## Backup and Retention

### S3 Versioning

Enable versioning to recover deleted files:

```bash
aws s3api put-bucket-versioning \
  --bucket fleet-feast-production \
  --versioning-configuration Status=Enabled
```

### Lifecycle Policies

Archive old files to cheaper storage (Glacier):

1. Go to **S3** → `fleet-feast-production` → **Management** → **Lifecycle Rules**
2. Create rule:
   - **Name**: `archive-old-documents`
   - **Filter**: Prefix `documents/`
   - **Transitions**: After 90 days → Glacier
   - **Expiration**: After 365 days → Delete

---

## Monitoring

### AWS S3 Metrics

- **Bucket Size**: Total storage used
- **Request Count**: Number of GET/PUT requests
- **Bandwidth**: Data transfer

### Cost Monitoring

```bash
aws ce get-cost-and-usage \
  --time-period Start=2024-12-01,End=2024-12-31 \
  --granularity MONTHLY \
  --metrics "BlendedCost" \
  --filter file://s3-cost-filter.json
```

---

## Troubleshooting

### CORS Errors

**Issue**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: Check S3 CORS configuration includes your domain.

### 403 Forbidden

**Issue**: `Access Denied` when accessing files

**Solution**:
1. Check bucket policy allows public read for `public/*`
2. Verify IAM user has `s3:GetObject` permission
3. Ensure presigned URL hasn't expired

### Slow Uploads

**Issue**: Uploads take >30 seconds

**Solution**:
1. Use direct upload (presigned URLs)
2. Compress images before upload
3. Use CloudFront for faster delivery

---

## Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [Next.js Image Optimization](https://nextjs.org/docs/api-reference/next/image)

---

**Document Status**: Complete
**Reviewed By**: Devon_DevOps
**Last Updated**: 2025-12-04

import fs from 'fs';
import path from 'path';

/**
 * Storage Abstraction Interface
 * Enables zero-setup local filesystem storage with clean pluggability for MinIO / AWS S3.
 */

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function saveUploadedFile(file: File): Promise<string> {
  const driver = process.env.STORAGE_DRIVER || 'local';

  if (driver === 's3' && process.env.S3_ACCESS_KEY && process.env.S3_BUCKET_NAME) {
    // S3/MinIO upload logic placeholder for production scalability
    // Can be instantiated with @aws-sdk/client-s3 if configured
    console.log('S3 Storage Driver active. Falling back to local storage if client not initialized.');
  }

  // Local filesystem driver
  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}-${sanitizedName}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  await fs.promises.writeFile(filePath, buffer);

  // Return public URL path
  return `/uploads/${filename}`;
}

export async function saveBase64Media(base64Data: string, extension: string = 'jpg'): Promise<string> {
  const buffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const filename = `${Date.now()}-snapshot.${extension}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}

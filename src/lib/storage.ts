import fs from 'fs';
import path from 'path';

/**
 * Local Filesystem Storage Service
 * Stores citizen media uploads (voice notes, incident photos, triage snapshots)
 * directly in the local filesystem under public/uploads.
 */

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function saveUploadedFile(file: File): Promise<string> {
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

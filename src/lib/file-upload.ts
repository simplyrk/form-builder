import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Define the upload directory
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

// Ensure the upload directory exists
export async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Generate a unique filename
export function generateUniqueFilename(originalFilename: string): string {
  const extension = originalFilename.split('.').pop();
  return `${uuidv4()}.${extension}`;
}

// Handle file upload
export async function handleFileUpload(file: File): Promise<{
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}> {
  await ensureUploadDir();

  // Generate a unique filename
  const uniqueFilename = generateUniqueFilename(file.name);
  const filePath = join(UPLOAD_DIR, uniqueFilename);

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Write the file to disk
  await writeFile(filePath, buffer);

  // Return file metadata with a consistent file path format (always starting with a slash)
  return {
    fileName: file.name,
    filePath: `/uploads/${uniqueFilename}`, // Always ensure the path starts with a slash
    fileSize: file.size,
    mimeType: file.type,
  };
} 
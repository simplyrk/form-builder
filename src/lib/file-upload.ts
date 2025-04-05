/**
 * File Upload Utility
 * This module handles file uploads in the application, including directory management
 * and file storage with unique filenames.
 * @module file-upload
 */

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

/** Directory where uploaded files are stored */
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

/**
 * Ensures that the upload directory exists, creating it if necessary
 * @returns {Promise<void>}
 */
export async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Generates a unique filename for an uploaded file
 * @param {string} originalFilename - The original filename of the uploaded file
 * @returns {string} A unique filename with the same extension as the original
 */
export function generateUniqueFilename(originalFilename: string): string {
  const extension = originalFilename.split('.').pop();
  return `${uuidv4()}.${extension}`;
}

/**
 * Handles the upload of a file, storing it with a unique filename
 * @param {File} file - The file to upload
 * @returns {Promise<{
 *   fileName: string;
 *   filePath: string;
 *   fileSize: number;
 *   mimeType: string;
 * }>} Metadata about the uploaded file
 * @throws {Error} If the file cannot be written to disk
 */
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
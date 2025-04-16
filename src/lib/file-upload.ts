/**
 * File Upload Utility
 * This module handles file uploads in the application, including directory management
 * and file storage with unique filenames.
 * @module file-upload
 */

import { existsSync } from 'fs';
import { writeFile , mkdir } from 'fs/promises';
import { join } from 'path';

import { v4 as uuidv4 } from 'uuid';

/** Directory where uploaded files are stored */
const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads');

/** Maximum file size in bytes (default: 10MB) */
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);

/** Allowed MIME types for file uploads */
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf').split(',');

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
 * Validates a file before upload
 * @param {File} file - The file to validate
 * @returns {Promise<{valid: boolean, error?: string}>} Validation result
 */
export async function validateFile(file: File): Promise<{valid: boolean, error?: string}> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the maximum allowed size of ${MAX_FILE_SIZE / 1048576}MB`
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
    };
  }

  // Additional security checks
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split('.').pop();
  
  // Check for potentially dangerous file extensions
  const dangerousExtensions = ['exe', 'dll', 'bat', 'cmd', 'sh', 'php', 'js', 'html', 'htm'];
  if (dangerousExtensions.includes(fileExtension || '')) {
    return {
      valid: false,
      error: `File extension .${fileExtension} is not allowed for security reasons`
    };
  }

  return { valid: true };
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
 * @throws {Error} If the file cannot be written to disk or fails validation
 */
export async function handleFileUpload(file: File): Promise<{
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}> {
  // Validate the file before processing
  const validation = await validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'File validation failed');
  }

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
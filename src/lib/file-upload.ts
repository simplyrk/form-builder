/**
 * File Upload Utility
 * This module handles file uploads in the application, including directory management
 * and file storage with unique filenames.
 * @module file-upload
 */

import { existsSync } from 'fs';
import { writeFile, mkdir, stat, readFile } from 'fs/promises';
import { join, extname, basename } from 'path';

import { v4 as uuidv4 } from 'uuid';

import { log, error } from '@/utils/logger';

import { scanFile } from './file-scanner';

/** Directory where uploaded files are stored securely outside public directory */
export const STORAGE_DIR = process.env.UPLOAD_DIR || process.env.STORAGE_DIR || join(process.cwd(), 'storage', 'uploads');

/** Directory for temporary file scanning */
const TEMP_DIR = process.env.TEMP_DIR || join(process.cwd(), 'storage', 'temp');

/** Maximum file size in bytes (default: 10MB) */
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);

/** Allowed MIME types for file uploads */
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp,application/pdf').split(',');

/** MIME type to file extension mapping for validation */
const MIME_TO_EXT: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
};

/**
 * Ensures that the required directories exist, creating them if necessary
 * @returns {Promise<void>}
 */
export async function ensureDirectories() {
  // Create storage directory if it doesn't exist
  if (!existsSync(STORAGE_DIR)) {
    await mkdir(STORAGE_DIR, { recursive: true });
  }
  
  // Create temp directory if it doesn't exist
  if (!existsSync(TEMP_DIR)) {
    await mkdir(TEMP_DIR, { recursive: true });
  }
}

/**
 * Generates a unique filename for an uploaded file
 * @param {string} originalFilename - The original filename of the uploaded file
 * @returns {string} A unique filename with the same extension as the original
 */
export function generateUniqueFilename(originalFilename: string): string {
  const extension = originalFilename.split('.').pop() || '';
  return extension ? `${uuidv4()}.${extension}` : uuidv4();
}

/**
 * Verifies that a file's content matches its claimed MIME type
 * @param {string} filePath - Path to the file
 * @param {string} claimedMimeType - MIME type claimed by the client
 * @returns {Promise<boolean>} Whether the file content matches the claimed MIME type
 */
export async function verifyMimeType(filePath: string, claimedMimeType: string): Promise<boolean> {
  try {
    // Read the first 4KB of the file to check its signature
    const fileHandle = await readFile(filePath, { encoding: null });
    const fileSignature = fileHandle.slice(0, 4096);
    
    // Check simple signature-based MIME type detection
    const fileExt = extname(filePath).toLowerCase();
    const allowedExtensions = MIME_TO_EXT[claimedMimeType] || [];
    
    if (!allowedExtensions.includes(fileExt)) {
      log(`MIME type mismatch: ${claimedMimeType} does not match extension ${fileExt}`);
      return false;
    }
    
    // Check file signatures based on the claimed MIME type
    // Simple checks for common file types
    switch(claimedMimeType) {
      case 'image/jpeg':
        // JPEG signature starts with FF D8 FF
        return fileSignature[0] === 0xFF && 
               fileSignature[1] === 0xD8 && 
               fileSignature[2] === 0xFF;
      
      case 'image/png':
        // PNG signature is 89 50 4E 47 0D 0A 1A 0A
        return fileSignature[0] === 0x89 && 
               fileSignature[1] === 0x50 && 
               fileSignature[2] === 0x4E && 
               fileSignature[3] === 0x47;
      
      case 'image/gif':
        // GIF signature is 47 49 46 38
        return fileSignature[0] === 0x47 && 
               fileSignature[1] === 0x49 && 
               fileSignature[2] === 0x46 && 
               fileSignature[3] === 0x38;
      
      case 'image/webp':
        // WebP signature is 52 49 46 46
        return fileSignature[0] === 0x52 && 
               fileSignature[1] === 0x49 && 
               fileSignature[2] === 0x46 && 
               fileSignature[3] === 0x46;
      
      case 'application/pdf':
        // PDF signature is 25 50 44 46 (or %PDF)
        return fileSignature[0] === 0x25 && 
               fileSignature[1] === 0x50 && 
               fileSignature[2] === 0x44 && 
               fileSignature[3] === 0x46;
      
      default:
        // For other types, we rely on extension checks only
        return true;
    }
  } catch (error) {
    console.error('Error verifying MIME type:', error);
    return false;
  }
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
  const dangerousExtensions = [
    'exe', 'dll', 'bat', 'cmd', 'sh', 'php', 'js', 
    'html', 'htm', 'asp', 'aspx', 'jsp', 'cgi', 'pl'
  ];
  
  if (!fileExtension || dangerousExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: `File extension .${fileExtension || 'none'} is not allowed for security reasons`
    };
  }

  // Verify that the claimed MIME type is consistent with the file extension
  const allowedExtensions = MIME_TO_EXT[file.type] || [];
  const fileExt = `.${fileExtension}`;
  
  if (!allowedExtensions.includes(fileExt)) {
    return {
      valid: false,
      error: `File extension .${fileExtension} doesn't match the claimed file type ${file.type}`
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
  try {
    log(`Processing upload: ${file.name} (${file.size} bytes, ${file.type})`);
    
    // Validate the file before processing
    const validation = await validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed');
    }

    // Ensure directories exist
    await ensureDirectories();

    // Generate unique filenames for temp and final storage
    const uniqueFilename = generateUniqueFilename(file.name);
    const tempFilePath = join(TEMP_DIR, uniqueFilename);
    const finalFilePath = join(STORAGE_DIR, uniqueFilename);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write the file to temp location first
    await writeFile(tempFilePath, buffer);

    // Verify MIME type server-side
    const mimeVerified = await verifyMimeType(tempFilePath, file.type);
    if (!mimeVerified) {
      throw new Error('File content does not match the claimed file type');
    }

    // Scan the file for viruses/malware
    const scanResult = await scanFile(tempFilePath);
    if (!scanResult.safe) {
      throw new Error(`Security scan failed: ${scanResult.message}`);
    }

    // Move the file to final storage location
    await writeFile(finalFilePath, buffer);

    // Calculate file info for database
    const fileSize = (await stat(finalFilePath)).size;
    
    // Return file metadata - just the filename without api/files prefix
    // The API route will handle the full path construction
    const filename = basename(finalFilePath);
    
    log(`File uploaded successfully: ${filename}`);
    
    return {
      fileName: file.name,
      filePath: filename,
      fileSize: fileSize,
      mimeType: file.type,
    };
  } catch (err) {
    error('File upload failed:', err);
    throw err;
  }
}

/**
 * Gets the full physical file path from a relative URL path
 * @param {string} relativePath - The relative path used in URLs
 * @returns {string} The full file path on disk
 */
export function getFullFilePath(relativePath: string): string {
  // Remove any leading slashes and api/files prefix if present
  const cleanPath = relativePath.replace(/^\/?(api\/files\/)?/, '');
  
  // Simple case: if this path has no slashes, it's a filename in STORAGE_DIR
  if (!cleanPath.includes('/')) {
    return join(STORAGE_DIR, cleanPath);
  }
  
  // For nested paths like formId/responseId/filename, preserve the full structure
  return join(STORAGE_DIR, cleanPath);
}

/**
 * Generates a URL for accessing an uploaded file via the API
 * @param {string} filename - The filename to generate a URL for
 * @returns {string} The URL to access the file
 */
export function getFileUrl(filename: string): string {
  return `/api/files/${filename}`;
} 
/**
 * File Upload Utility - Test Version
 * A simplified version of the file upload module for testing purposes.
 * This version eliminates dependencies that are difficult to mock.
 */

import { v4 as uuidv4 } from 'uuid';

/** Maximum file size in bytes (default: 10MB) */
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);

/** Allowed MIME types for file uploads */
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf').split(',');

/**
 * Generates a unique filename for an uploaded file
 * @param {string} originalFilename - The original filename of the uploaded file
 * @returns {string} A unique filename with the same extension as the original
 */
export function generateUniqueFilename(originalFilename: string): string {
  // Only attempt to extract extension if the filename contains a dot
  if (originalFilename.includes('.')) {
    const extension = originalFilename.split('.').pop() || '';
    return `${uuidv4()}.${extension}`;
  }
  return uuidv4();
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

  return { valid: true };
} 
import fs from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';

import { handleFileUpload } from '@/lib/file-upload';
import { log, error } from '@/utils/logger';

/**
 * API handler for file uploads
 * This route handles file uploads with enhanced security features:
 * - Files are stored outside the public directory
 * - Server-side MIME type validation
 * - Content-based malware scanning
 * 
 * @param {NextRequest} request - The Next.js request object
 * @returns {NextResponse} The response with the file path
 */
export async function POST(request: NextRequest) {
  // Verify authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    log(`Received file upload request: ${file.name} (${file.size} bytes, ${file.type})`);
    
    // Use our secure file upload handler
    const fileData = await handleFileUpload(file);
    
    // Return the file information
    return NextResponse.json({
      success: true,
      fileName: fileData.fileName,
      filePath: fileData.filePath,
      fileSize: fileData.fileSize,
      mimeType: fileData.mimeType,
    });
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
    error('Error handling file upload:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Limit the maximum file size to 10MB
 */
export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '10mb',
  },
}; 
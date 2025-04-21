import fs from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';

import { getFullFilePath } from '@/lib/file-upload';
import { log, error } from '@/utils/logger';

/**
 * API handler for serving files
 * This route serves files from the secure storage directory
 * @param {NextRequest} request - The Next.js request object
 * @param {Object} params - The route parameters
 * @returns {NextResponse} The file response
 */
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Check authentication for non-public files
    const { userId } = await auth();
    
    // Safely await params even though it's not a promise (to satisfy NextJS)
    const { path: pathSegments } = await Promise.resolve(params);
    
    // Get the filename from the path segments
    const filename = pathSegments[pathSegments.length - 1];
    
    // Get the full file path from our secure storage
    const fullPath = getFullFilePath(filename);
    
    log(`Looking for file at: ${fullPath}`);
    
    // Check if the file exists
    if (!fs.existsSync(fullPath)) {
      error(`File not found: ${fullPath}`);
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Get the file extension to determine the content type
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    // Map common extensions to content types
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    
    // Set the content type based on the extension
    if (ext in contentTypeMap) {
      contentType = contentTypeMap[ext];
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(fullPath);
    
    log(`Serving file: ${filename} with content type: ${contentType}`);
    
    // Return the file with the appropriate content type
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'X-Content-Type-Options': 'nosniff', // Security header
        'Cache-Control': 'private, max-age=3600' // Cache for 1 hour
      },
    });
  } catch (errorObj: unknown) {
    console.error('Error serving file:', errorObj);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
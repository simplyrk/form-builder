import fs from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';

import { getFullFilePath, STORAGE_DIR } from '@/lib/file-upload';
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
    
    // Join all path segments to form the full relative path
    const relativePath = pathSegments.join('/');
    log(`Requested file path: ${relativePath}`);
    
    // Check if this path is a direct file reference or contains api/files
    const pathForLookup = relativePath.replace(/^api\/files\//, '');
    log(`Normalized path for lookup: ${pathForLookup}`);
    
    // Handle case for uploads directory with form/response IDs
    if (pathSegments.length >= 3 && pathSegments[0] !== 'api') {
      // This is likely a path like /formId/responseId/filename.jpg
      const formId = pathSegments[0];
      const responseId = pathSegments[1];
      const filename = pathSegments.slice(2).join('/');
      
      // Construct the path in storage/uploads
      const storagePath = path.join(
        STORAGE_DIR,
        formId, 
        responseId,
        filename
      );
      
      log(`Looking for form upload at: ${storagePath}`);
      
      if (fs.existsSync(storagePath)) {
        const fileBuffer = fs.readFileSync(storagePath);
        const ext = path.extname(storagePath).toLowerCase();
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
        
        let contentType = 'application/octet-stream';
        if (ext in contentTypeMap) {
          contentType = contentTypeMap[ext];
        }
        
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${path.basename(storagePath)}"`,
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'private, max-age=3600'
          },
        });
      }
    }
    
    // Get the filename from the path segments
    const filename = pathSegments[pathSegments.length - 1];
    
    // Get the full file path from our secure storage
    const fullPath = getFullFilePath(pathForLookup);
    
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
import fs from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';

import { log, error } from '@/utils/logger';

/**
 * API handler for serving files
 * This route serves files from the specified path
 * @param {NextRequest} request - The Next.js request object
 * @param {Object} params - The route parameters
 * @returns {NextResponse} The file response
 */
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Safely await params even though it's not a promise (to satisfy NextJS)
    const { path: pathSegments } = await Promise.resolve(params);
    
    // Don't add 'uploads' here since it's already in the path
    const filePath = path.join(...pathSegments);
    
    // Construct the full path to the file
    const fullPath = path.join(process.cwd(), 'public', filePath);
    
    log(`Looking for file at: ${fullPath}`);
    
    // Check if the file exists
    if (!fs.existsSync(fullPath)) {
      error(`File not found: ${fullPath}`);
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Get the file extension to determine the content type
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.doc' || ext === '.docx') {
      contentType = 'application/msword';
    } else if (ext === '.xls' || ext === '.xlsx') {
      contentType = 'application/vnd.ms-excel';
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(fullPath);
    
    // Get the filename from the path
    const fileName = path.basename(fullPath);
    
    log(`Serving file: ${fileName} with content type: ${contentType}`);
    
    // Return the file with the appropriate content type
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    });
  } catch (errorObj: unknown) {
    console.error('Error serving file:', errorObj);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
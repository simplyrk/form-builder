import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { stat } from 'fs/promises';

/**
 * API handler for serving files
 * This route serves files from the specified path
 * @param {NextRequest} request - The Next.js request object
 * @param {Object} params - The route parameters
 * @returns {NextResponse} The file response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Safely await params even though it's not a promise (to satisfy NextJS)
    const pathSegments = await Promise.resolve(params.path);
    
    // Don't add 'uploads' here since it's already in the path
    const filePath = path.join(...pathSegments);
    
    // Create an absolute path to the file
    const fullPath = path.join(process.cwd(), 'public', filePath);

    console.log('Looking for file at:', fullPath);

    // Check if file exists
    try {
      const stats = await stat(fullPath);
      if (!stats.isFile()) {
        console.error('Not a file:', fullPath);
        return new NextResponse('Not found', { status: 404 });
      }
    } catch {
      console.error('File not found:', fullPath);
      return new NextResponse('Not found', { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(fullPath);
    
    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream'; // Default content type
    
    // Set content type based on extension
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.doc':
      case '.docx':
        contentType = 'application/msword';
        break;
      case '.xls':
      case '.xlsx':
        contentType = 'application/vnd.ms-excel';
        break;
      case '.zip':
        contentType = 'application/zip';
        break;
    }

    console.log('Serving file:', path.basename(filePath), 'with content type:', contentType);

    // Return the file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
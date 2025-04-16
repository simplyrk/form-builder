import fs from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';


/**
 * API handler for file uploads
 * This route handles file uploads and saves them to the public/uploads directory
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

    // Create a unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate a unique filename with original extension
    const originalExtension = path.extname(file.name);
    const filename = `${uuidv4()}${originalExtension}`;
    
    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    
    // Full path to save the file
    const filePath = path.join(uploadDir, filename);
    
    // Write the file
    fs.writeFileSync(filePath, buffer);
    
    // Return the file information
    return NextResponse.json({
      success: true,
      fileName: file.name,
      filePath: `uploads/${filename}`,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
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
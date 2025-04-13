import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { handleFileUpload, validateFile } from '@/lib/file-upload';
import { headers } from 'next/headers';

// Simple in-memory rate limiting
// In production, use a proper rate limiting solution like Redis
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

/**
 * Check if a request should be rate limited
 * @param {string} identifier - The identifier for rate limiting (e.g., IP or user ID)
 * @returns {boolean} Whether the request should be rate limited
 */
function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const userRateLimit = rateLimit.get(identifier);
  
  if (!userRateLimit) {
    rateLimit.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (now > userRateLimit.resetTime) {
    rateLimit.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (userRateLimit.count >= MAX_REQUESTS) {
    return true;
  }
  
  userRateLimit.count += 1;
  return false;
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Apply rate limiting
    if (isRateLimited(userId)) {
      return new NextResponse('Too many requests', { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'Content-Type': 'application/json',
        }
      });
    }

    // Get the file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'No file uploaded' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate the file
    const validation = await validateFile(file);
    if (!validation.valid) {
      return new NextResponse(JSON.stringify({ error: validation.error }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Upload the file
    const fileData = await handleFileUpload(file);

    // Return the file data
    return NextResponse.json({ 
      success: true,
      file: fileData
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Error uploading file',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 
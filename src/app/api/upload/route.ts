import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    // Here you would typically upload the file to a storage service like S3
    // For this example, we'll just return a mock URL
    const fileUrl = `https://storage.example.com/${file.name}`;

    return NextResponse.json({ fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return new NextResponse('Error uploading file', { status: 500 });
  }
} 
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const responses = await prisma.response.findMany({
      where: { submittedBy: userId },
      include: {
        fields: true,
        form: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error fetching user responses:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const forms = await prisma.form.findMany({
      where: { published: true },
      include: { fields: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error fetching available forms:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
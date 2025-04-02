import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { clerkClient } from '@clerk/clerk-sdk-node';
import type { Form, Response } from '@/types/form';
import { ResponsesClient } from './responses-client';

interface FormResponsesPageProps {
  params: {
    id: string;
  };
}

export default async function FormResponsesPage({ params }: FormResponsesPageProps) {
  const { userId } = await auth();
  if (!userId) {
    notFound();
  }

  const form = await prisma.form.findUnique({
    where: { id: params.id },
    include: {
      fields: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  }) as Form | null;

  if (!form || form.createdBy !== userId) {
    notFound();
  }

  const responses = await prisma.response.findMany({
    where: { formId: params.id },
    include: {
      fields: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  }) as Response[];

  // Get all unique user IDs from responses
  const userIds = [...new Set(responses.map((r: Response) => r.submittedBy))];
  
  // Fetch user data from Clerk
  const users = await Promise.all(
    userIds.map(async (id: string) => {
      try {
        const user = await clerkClient.users.getUser(id);
        return {
          id,
          name: `${user.firstName} ${user.lastName}`.trim() || 'Anonymous User',
        };
      } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        return {
          id,
          name: 'Anonymous User',
        };
      }
    })
  );

  // Create a map of user IDs to names
  const userMap = new Map(users.map(user => [user.id, user.name]));

  return <ResponsesClient form={form} responses={responses} userMap={userMap} />;
} 
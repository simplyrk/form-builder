import { notFound } from 'next/navigation';

import { createClerkClient } from '@clerk/backend';
import { auth } from '@clerk/nextjs/server';

import { prisma } from '@/lib/prisma';
import type { Form, Response } from '@/types/form';

import { ResponsesClient } from './responses-client';


interface FormResponsesPageProps {
  params: {
    id: string;
  };
}

export default async function FormResponsesPage({ params }: FormResponsesPageProps) {
  const { userId } = await auth();
  const { id } = await Promise.resolve(params);
  
  if (!userId) {
    notFound();
  }

  // First, check if the form exists and if the user has access to it
  const form = await prisma.form.findUnique({
    where: { id: id },
    include: {
      fields: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  }) as Form | null;

  // Admin can only access forms they created
  if (!form || form.createdBy !== userId) {
    notFound();
  }

  // Fetch all responses for this form (admin can see all responses)
  const responses = await prisma.response.findMany({
    where: { formId: id },
    include: {
      fields: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  }) as Response[];

  // Get all unique user IDs from responses
  const userIds = Array.from(new Set(responses.map((r: Response) => r.submittedBy)));
  
  // Fetch user data from Clerk
  const users = await Promise.all(
    userIds.map(async (id: string) => {
      try {
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const user = await clerk.users.getUser(id);
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
import { notFound } from 'next/navigation';

import { auth } from '@clerk/nextjs/server';

import { FormSpecificResponses } from '@/components/form-specific-responses';
import { prisma } from '@/lib/prisma';
import type { Form, Response, ResponseField } from '@/types/form';

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

  // Properly await the params object as required by Next.js 13+
  const { id: formId } = await Promise.resolve(params);

  // First, check if the form exists and if the user has access to it
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      fields: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  }) as Form | null;

  // User can only access published forms or forms they created
  if (!form || (!form.published && form.createdBy !== userId)) {
    notFound();
  }

  // Fetch only the user's responses for this form
  const responses = await prisma.response.findMany({
    where: { 
      formId,
      submittedBy: userId, // Only get responses submitted by this user
    },
    include: {
      fields: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Add required fields to match Response and ResponseField types
  const typedResponses = responses.map(response => ({
    ...response,
    updatedAt: response.createdAt, // Use createdAt as updatedAt if not available
    fields: response.fields.map(field => ({
      ...field,
      createdAt: response.createdAt,
      updatedAt: response.createdAt,
    })),
  })) as Response[];

  return (
    <div className="p-6">
      <FormSpecificResponses form={form} responses={typedResponses} />
    </div>
  );
} 
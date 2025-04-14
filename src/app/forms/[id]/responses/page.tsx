import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { FormSpecificResponses } from '@/components/form-specific-responses';
import { FormsLayout } from '@/components/forms-layout';
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

  if (!form || (!form.published && form.createdBy !== userId)) {
    notFound();
  }

  const responses = await prisma.response.findMany({
    where: { 
      formId: params.id,
      submittedBy: userId,
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
    <FormsLayout>
      <div className="p-6">
        <FormSpecificResponses form={form} responses={typedResponses} />
      </div>
    </FormsLayout>
  );
} 
import { notFound } from 'next/navigation';

import { auth } from '@clerk/nextjs/server';

import { ResponseViewForm } from '@/components/response-view-form';
import { prisma } from '@/lib/prisma';
import type { Form, Response } from '@/types/form';

interface ResponseViewPageProps {
  params: {
    id: string;
    responseId: string;
  };
}

export default async function ResponseViewPage({ params }: ResponseViewPageProps) {
  const { userId } = await auth();
  if (!userId) {
    notFound();
  }

  // Properly await the params object as required by Next.js 13+
  const { id: formId, responseId } = await Promise.resolve(params);

  // Get the form with its fields
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

  if (!form) {
    notFound();
  }

  // Get the response with its fields
  const response = await prisma.response.findUnique({
    where: {
      id: responseId,
      formId: formId,
    },
    include: {
      fields: true,
    },
  });

  if (!response) {
    notFound();
  }

  // Add required fields to match Response type
  const typedResponse = {
    ...response,
    updatedAt: response.createdAt, // Use createdAt as updatedAt if not available
    fields: response.fields.map(field => ({
      ...field,
      createdAt: response.createdAt,
      updatedAt: response.createdAt,
    })),
  } as Response;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">View Response</h1>
        <p className="text-muted-foreground">
          Viewing response for form: {form.title}
        </p>
      </div>
      <ResponseViewForm form={form} response={typedResponse} />
    </div>
  );
}

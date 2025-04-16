import { notFound, redirect } from 'next/navigation';

import { auth } from '@clerk/nextjs/server';

import { prisma } from '@/lib/prisma';
import type { Form, Response } from '@/types/form';

import { EditResponseForm } from './edit-response-form';


interface EditResponsePageProps {
  params: {
    id: string;
    responseId: string;
  };
}

export default async function EditResponsePage({ params }: EditResponsePageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Properly await the params object as required by Next.js 13+
  const { id: formId, responseId } = await Promise.resolve(params);

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

  const response = await prisma.response.findUnique({
    where: { id: responseId },
    include: {
      fields: true,
    },
  }) as Response | null;

  if (!response || response.formId !== form.id || response.submittedBy !== userId) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit Response</h1>
        <p className="text-muted-foreground">
          Edit your response to {form.title}
        </p>
      </div>
      <EditResponseForm form={form} response={response} />
    </div>
  );
} 
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { EditResponseForm } from './edit-response-form';
import type { Form, Response } from '@/types/form';

interface EditResponsePageProps {
  params: {
    id: string;
    responseId: string;
  };
}

export default async function EditResponsePage({ params }: EditResponsePageProps) {
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

  const response = await prisma.response.findUnique({
    where: { id: params.responseId },
    include: {
      fields: true,
    },
  }) as Response | null;

  if (!response || response.formId !== form.id) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit Response</h1>
        <p className="text-muted-foreground">
          Edit the response for form: {form.title}
        </p>
      </div>
      <EditResponseForm form={form} response={response} />
    </div>
  );
} 
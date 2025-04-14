import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { EditResponseForm } from './edit-response-form';
import type { Form, Response } from '@/types/form';
import { FormsLayout } from '@/components/forms-layout';

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

  if (!form || form.createdBy !== userId) {
    notFound();
  }

  const response = await prisma.response.findUnique({
    where: { id: responseId },
    include: {
      fields: true,
    },
  }) as Response | null;

  if (!response || response.formId !== form.id) {
    notFound();
  }

  return (
    <FormsLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Edit Response</h1>
          <p className="text-muted-foreground">
            Edit the response for form: {form.title}
          </p>
        </div>
        <EditResponseForm form={form} response={response} />
      </div>
    </FormsLayout>
  );
} 
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { EditResponseForm } from '@/app/forms/[id]/edit/[responseId]/edit-response-form';
import type { Form, Response } from '@/types/form';

export default async function EditResponsePage({
  params,
}: {
  params: { id: string; responseId: string };
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Safely resolve params
  const id = await Promise.resolve(params.id);
  const responseId = await Promise.resolve(params.responseId);

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      fields: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  }) as Form | null;

  if (!form) {
    redirect('/');
  }

  const response = await prisma.response.findUnique({
    where: { id: responseId },
    include: {
      fields: true,
    },
  }) as Response | null;

  if (!response || response.submittedBy !== userId) {
    redirect('/');
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
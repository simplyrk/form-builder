import { redirect } from 'next/navigation';

import { auth } from '@clerk/nextjs/server';

import { EditResponseForm } from '@/app/forms/[id]/edit/[responseId]/edit-response-form';
import { prisma } from '@/lib/prisma';
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
    <div className="p-6">
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
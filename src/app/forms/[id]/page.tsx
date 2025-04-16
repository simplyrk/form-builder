import { notFound } from 'next/navigation';

import { auth } from '@clerk/nextjs/server';

import { prisma } from '@/lib/prisma';
import type { Form } from '@/types/form';

import FormPageClient from './form-page-client';



interface FormPageProps {
  params: {
    id: string;
  };
}

export default async function FormPage({ params }: FormPageProps) {
  const { userId } = await auth();
  const { id: formId } = await Promise.resolve(params);
  
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { 
      fields: {
        orderBy: { order: 'asc' }
      },
      responses: true
    }
  }) as Form | null;

  if (!form) {
    notFound();
  }

  // Check if the form is published or if the user is the creator
  if (!form.published && form.createdBy !== userId) {
    notFound();
  }

  return <FormPageClient form={form} userId={userId} />;
} 
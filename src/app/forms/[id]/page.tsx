import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import type { Form } from '@/types/form';
import FormPageClient from './form-page-client';

interface FormPageProps {
  params: {
    id: string;
  };
}

export default async function FormPage({ params }: FormPageProps) {
  const { userId } = await auth();
  const formId = params.id;
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { 
      fields: {
        orderBy: {
          order: 'asc'
        }
      }
    },
  }) as Form | null;

  if (!form || (!form.published && form.createdBy !== userId)) {
    notFound();
  }

  return <FormPageClient form={form} userId={userId} />;
} 
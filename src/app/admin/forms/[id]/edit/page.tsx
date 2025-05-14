import { notFound } from 'next/navigation';

import { auth } from '@clerk/nextjs/server';

import { FormBuilder } from '@/components/form-builder';
import { Container } from '@/components/ui/container';
import { prisma } from '@/lib/prisma';
import type { Form } from '@/types/form';

interface EditFormPageProps {
  params: {
    id: string;
  };
}

export default async function EditFormPage({ params }: EditFormPageProps) {
  const { userId } = await auth();
  const { id } = await Promise.resolve(params);
  
  const form = await prisma.form.findUnique({
    where: { id },
    include: { 
      fields: {
        orderBy: {
          order: 'asc'
        }
      }
    },
  }) as Form | null;

  if (!form || form.createdBy !== userId) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6">
      <Container size="full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl text-left text-foreground">Edit Form</h1>
          <p className="text-muted-foreground text-left">{form.title}</p>
        </div>

        <FormBuilder form={form} />
      </Container>
    </div>
  );
}
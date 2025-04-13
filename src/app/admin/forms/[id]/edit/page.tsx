import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import type { Form } from '@/types/form';
import { FormBuilder } from '@/components/form-builder';
import { FormsLayout } from '@/components/forms-layout';

interface EditFormPageProps {
  params: {
    id: string;
  };
}

export default async function EditFormPage({ params }: EditFormPageProps) {
  const { userId } = await auth();
  
  const form = await prisma.form.findUnique({
    where: { id: params.id },
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
    <FormsLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit Form</h1>
          <p className="text-muted-foreground">{form.title}</p>
        </div>

        <FormBuilder form={form} />
      </div>
    </FormsLayout>
  );
} 
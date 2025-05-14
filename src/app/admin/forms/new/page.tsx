import { redirect } from 'next/navigation';

import { auth } from '@clerk/nextjs/server';

import { FormBuilder } from '@/components/form-builder';
import { Container } from '@/components/ui/container';
import { prisma } from '@/lib/prisma';
import { TEXT } from '@/lib/text-constants';

export default async function NewFormPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="p-4 sm:p-6">
      <Container size="full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl text-left">{TEXT.CREATE_NEW_FORM}</h1>
        </div>

        <FormBuilder
          onSave={async (formData) => {
            'use server';
            
            const { userId } = await auth();
            if (!userId) {
              throw new Error('Not authenticated');
            }

            await prisma.form.create({
              data: {
                title: formData.title,
                description: formData.description || '',
                formGroup: formData.formGroup || '',
                createdBy: userId,
                fields: {
                  create: formData.fields.map((field) => ({
                    label: field.label,
                    type: field.type,
                    required: field.required,
                    options: field.options || [],
                    order: field.order,
                    helpText: field.helpText || null,
                  })),
                },
              },
            });

            redirect('/admin');
          }}
        />
      </Container>
    </div>
  );
}
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { FormBuilder } from '@/components/form-builder';

export default async function NewFormPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Form</h1>
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
              description: formData.description,
              createdBy: userId,
              fields: {
                create: formData.fields.map((field) => ({
                  label: field.label,
                  type: field.type,
                  required: field.required,
                  options: field.options,
                  order: field.order,
                })),
              },
            },
          });

          redirect('/admin');
        }}
      />
    </div>
  );
} 
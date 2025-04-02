'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import type { Form, FormInput, FieldInput } from '@/types/form';

export async function createForm(data: FormInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const form = await prisma.form.create({
    data: {
      title: data.title,
      description: data.description,
      createdBy: userId,
      fields: {
        create: data.fields.map((field, index) => ({
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options,
          order: index,
        })),
      },
    },
    include: {
      fields: true,
    },
  });

  revalidatePath('/admin');
  return form as Form;
}

export async function updateForm(id: string, data: FormInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // First verify that the form belongs to the user
  const form = await prisma.form.findUnique({
    where: { id },
    include: { fields: true },
  });

  if (!form || form.createdBy !== userId) {
    throw new Error('Unauthorized');
  }

  // Delete existing fields
  await prisma.field.deleteMany({
    where: { formId: id },
  });

  // Update form and create new fields
  const updatedForm = await prisma.form.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      fields: {
        create: data.fields.map((field, index) => ({
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options,
          order: index,
        })),
      },
    },
    include: {
      fields: true,
    },
  });

  revalidatePath('/admin');
  return updatedForm as Form;
}

export async function toggleFormPublish(formId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const form = await prisma.form.findUnique({
    where: { id: formId },
  });

  if (!form || form.createdBy !== userId) {
    throw new Error('Form not found or unauthorized');
  }

  return prisma.form.update({
    where: { id: formId },
    data: { published: !form.published },
  });
}

export async function deleteForm(formId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const form = await prisma.form.findUnique({
    where: { id: formId },
  });

  if (!form || form.createdBy !== userId) {
    throw new Error('Form not found or unauthorized');
  }

  // Delete everything in the correct order using a transaction
  await prisma.$transaction(async (tx) => {
    // Get all response IDs for this form
    const responses = await tx.response.findMany({
      where: { formId },
      select: { id: true },
    });
    const responseIds = responses.map((r: { id: string }) => r.id);

    // Delete response fields
    await tx.responseField.deleteMany({
      where: { responseId: { in: responseIds } },
    });

    // Delete responses
    await tx.response.deleteMany({
      where: { formId },
    });

    // Delete form fields
    await tx.field.deleteMany({
      where: { formId },
    });

    // Finally delete the form
    await tx.form.delete({
      where: { id: formId },
    });
  });
}

export async function deleteResponses(responseIds: string[]) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Get the form IDs for these responses
  const responses = await prisma.response.findMany({
    where: { id: { in: responseIds } },
    select: { formId: true },
  });

  // Verify the user owns all the forms
  const formIds = [...new Set(responses.map(r => r.formId))];
  const forms = await prisma.form.findMany({
    where: { id: { in: formIds } },
    select: { id: true, createdBy: true },
  });

  const unauthorizedForms = forms.filter(form => form.createdBy !== userId);
  if (unauthorizedForms.length > 0) {
    throw new Error('Unauthorized to delete responses from some forms');
  }

  // Delete the responses
  await prisma.response.deleteMany({
    where: { id: { in: responseIds } },
  });

  return { success: true };
}

export async function updateResponse(responseId: string, fieldValues: Record<string, string>) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Get the response and its form
  const response = await prisma.response.findUnique({
    where: { id: responseId },
    include: { form: true },
  });

  if (!response || response.form.createdBy !== userId) {
    throw new Error('Response not found or unauthorized');
  }

  // Delete existing response fields
  await prisma.responseField.deleteMany({
    where: { responseId },
  });

  // Create new response fields
  await prisma.responseField.createMany({
    data: Object.entries(fieldValues).map(([fieldId, value]) => ({
      responseId,
      fieldId,
      value,
    })),
  });

  return { success: true };
}

export async function submitResponse(formId: string, formData: Record<string, string>) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Create the response
    const response = await prisma.response.create({
      data: {
        formId,
        submittedBy: userId,
        fields: {
          create: Object.entries(formData).map(([fieldId, value]) => ({
            fieldId,
            value,
          })),
        },
      },
    });

    revalidatePath(`/forms/${formId}`);
    return { success: true, response };
  } catch (error) {
    console.error('Error submitting response:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit response' 
    };
  }
} 
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

export async function toggleFormPublish(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // First verify that the form belongs to the user
  const form = await prisma.form.findUnique({
    where: { id },
  });

  if (!form || form.createdBy !== userId) {
    throw new Error('Unauthorized');
  }

  const updatedForm = await prisma.form.update({
    where: { id },
    data: {
      published: !form.published,
    },
    include: {
      fields: true,
    },
  });

  revalidatePath('/admin');
  return updatedForm as Form;
}

export async function deleteForm(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // First verify that the form belongs to the user
  const form = await prisma.form.findUnique({
    where: { id },
  });

  if (!form || form.createdBy !== userId) {
    throw new Error('Unauthorized');
  }

  // Delete the form (this will cascade delete the fields)
  await prisma.form.delete({
    where: { id },
  });

  revalidatePath('/admin');
}

export async function deleteResponses(responseIds: string[]) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // First verify that all responses exist and belong to either the user or their forms
    const responses = await prisma.response.findMany({
      where: {
        id: { in: responseIds },
      },
      include: {
        form: true,
      },
    });

    if (responses.length === 0) {
      return { success: false, error: 'No responses found' };
    }

    // Check if user is authorized to delete each response
    const unauthorizedResponses = responses.filter(
      (response: { form: { createdBy: string }; submittedBy: string }) => 
        response.form.createdBy !== userId && response.submittedBy !== userId
    );

    if (unauthorizedResponses.length > 0) {
      return { success: false, error: 'Unauthorized: Cannot delete responses that do not belong to you or your forms' };
    }

    // Delete response fields first
    await prisma.responseField.deleteMany({
      where: {
        responseId: { in: responseIds },
      },
    });

    // Then delete the responses
    await prisma.response.deleteMany({
      where: {
        id: { in: responseIds },
      },
    });

    // Revalidate all relevant paths
    revalidatePath('/admin');
    revalidatePath('/forms');
    responses.forEach((response: { formId: string }) => {
      revalidatePath(`/admin/forms/${response.formId}/responses`);
      revalidatePath(`/forms/${response.formId}/responses`);
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting responses:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete responses' };
  }
}

export async function updateResponse(responseId: string, formData: Record<string, string>) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Get the response and its form to verify ownership
  const response = await prisma.response.findUnique({
    where: { id: responseId },
    include: { form: true },
  });

  // Allow both the form creator and the response submitter to update
  if (!response || (response.form.createdBy !== userId && response.submittedBy !== userId)) {
    throw new Error('Unauthorized');
  }

  // Delete existing field responses
  await prisma.responseField.deleteMany({
    where: { responseId },
  });

  // Create new field responses
  const fieldResponses = Object.entries(formData).map(([fieldId, value]) => ({
    responseId,
    fieldId,
    value,
  }));

  await prisma.responseField.createMany({
    data: fieldResponses,
  });

  revalidatePath(`/admin/forms/${response.formId}/responses`);
  revalidatePath(`/forms/${response.formId}/responses`);
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
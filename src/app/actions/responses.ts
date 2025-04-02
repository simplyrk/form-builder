'use server';

import { prisma } from '@/lib/prisma';

export async function submitForm(formId: string, userId: string | null, data: Record<string, any>) {
  await prisma.response.create({
    data: {
      formId,
      submittedBy: userId || 'anonymous',
      fields: {
        create: Object.entries(data).map(([fieldId, value]) => ({
          fieldId,
          value: value.toString(),
        })),
      },
    },
  });
} 
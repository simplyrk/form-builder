import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import type { Form, Response, FormField, ResponseField, FormResponse } from '@/types/form';


interface EditResponsePageProps {
  params: {
    id: string;
    responseId: string;
  };
}

// This is a redirect page for backward compatibility
export default async function EditResponsePage({ params }: EditResponsePageProps) {
  const { id: formId, responseId } = await Promise.resolve(params);
  
  // Redirect to the new consolidated edit response route
  redirect(`/forms/${formId}/responses/${responseId}/edit`);
} 
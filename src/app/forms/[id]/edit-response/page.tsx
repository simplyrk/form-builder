import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { EditResponseForm } from './edit-response-form';

interface EditResponsePageProps {
  params: {
    id: string;
    responseId: string;
  };
}

export default async function EditResponsePage({ params }: EditResponsePageProps) {
  const { id: formId, responseId } = params;
  
  try {
    const [form, response] = await Promise.all([
      prisma.form.findUnique({
        where: { id: formId },
        include: { fields: true },
      }),
      prisma.response.findUnique({
        where: { id: responseId },
        include: { fields: true },
      })
    ]);
    
    if (!form || !response) {
      return notFound();
    }
    
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Response</h1>
        <EditResponseForm form={form} response={response} />
      </div>
    );
  } catch (error) {
    console.error('Error loading form or response:', error);
    return notFound();
  }
} 
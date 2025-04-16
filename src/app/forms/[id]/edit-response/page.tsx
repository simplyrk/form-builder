import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import type { Form, Response, FormField, ResponseField, FormResponse } from '@/types/form';

import { EditResponseForm } from './edit-response-form';


interface EditResponsePageProps {
  params: {
    id: string;
    responseId: string;
  };
}

export default async function EditResponsePage({ params }: EditResponsePageProps) {
  const { id: formId, responseId } = await Promise.resolve(params);
  
  try {
    const [formData, responseData] = await Promise.all([
      prisma.form.findUnique({
        where: { id: formId },
        include: { 
          fields: true,
          responses: {
            include: {
              fields: true
            }
          }
        },
      }),
      prisma.response.findUnique({
        where: { id: responseId },
        include: { fields: true },
      })
    ]);
    
    if (!formData || !responseData) {
      return notFound();
    }
    
    const form = {
      ...formData,
      updatedAt: formData.updatedAt || formData.createdAt,
      fields: formData.fields.map(field => ({
        ...field,
        createdAt: formData.createdAt,
        updatedAt: formData.updatedAt || formData.createdAt,
      })),
      responses: formData.responses.map(response => ({
        ...response,
        updatedAt: response.createdAt,
        fields: response.fields.map(field => ({
          ...field,
          createdAt: response.createdAt,
          updatedAt: response.createdAt,
        }))
      }))
    } as Form;
    
    const response = {
      ...responseData,
      updatedAt: responseData.createdAt,
      fields: responseData.fields.map(field => ({
        ...field,
        createdAt: responseData.createdAt,
        updatedAt: responseData.createdAt,
      })),
    } as Response;
    
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
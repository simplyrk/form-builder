'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { deleteResponses } from '@/app/actions/forms';
import { CSVExportButton } from '@/components/csv-export-button';
import { ResponseTable } from '@/components/response-table';
import { useToast } from '@/components/ui/use-toast';
import type { Form, Response } from '@/types/form';


interface ResponsesClientProps {
  form: Form;
  responses: Response[];
  userMap: Map<string, string>;
}

export function ResponsesClient({ form, responses, userMap }: ResponsesClientProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Process responses to ensure file paths are properly formatted
  const processedResponses = responses.map(response => ({
    ...response,
    fields: response.fields.map(field => ({
      ...field,
      // Ensure file paths are properly formatted
      filePath: field.filePath ? (field.filePath.startsWith('/api/files/') ? field.filePath : `/api/files/${field.filePath.replace(/^\/+/, '')}`) : null,
    })),
  }));

  const handleDelete = async (responseIds: string[]) => {
    setIsDeleting(true);
    try {
      const result = await deleteResponses(form.id, responseIds);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Selected responses deleted successfully',
        });
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete responses',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting responses:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Form Responses</h1>
        <p className="text-muted-foreground">
          View and manage responses for {form.title}
        </p>
      </div>
      <div className="mb-4 flex justify-end">
        <CSVExportButton
          form={form}
          responses={processedResponses}
          userMap={userMap}
        />
      </div>
      <ResponseTable
        form={form}
        responses={processedResponses}
        userMap={userMap}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
} 
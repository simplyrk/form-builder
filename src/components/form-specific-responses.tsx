'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { deleteResponses } from '@/app/actions/forms';
import { ResponseTable } from '@/components/response-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import type { Form, Response } from '@/types/form';

interface FormSpecificResponsesProps {
  form: Form;
  responses: Response[];
}

export function FormSpecificResponses({ form, responses }: FormSpecificResponsesProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{form.title}</h2>
          <p className="text-muted-foreground">{form.description}</p>
        </div>
        <Button variant="accent" size="lg" onClick={() => router.push(`/forms/${form.id}`)}>
          Fill Form
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Responses</CardTitle>
        </CardHeader>
        <CardContent>
          {processedResponses.length === 0 ? (
            <p className="text-muted-foreground">You haven&apos;t submitted any responses to this form yet.</p>
          ) : (
            <ResponseTable
              form={form}
              responses={processedResponses}
              userMap={new Map([[processedResponses[0].submittedBy || 'anonymous', 'You']])}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
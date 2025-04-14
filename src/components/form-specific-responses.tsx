'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserResponsesTable } from '@/components/user-responses-table';
import { deleteResponses } from '@/app/actions/forms';
import { useToast } from '@/components/ui/use-toast';
import type { Form, Response } from '@/types/form';

interface FormSpecificResponsesProps {
  form: Form;
  responses: Response[];
}

export function FormSpecificResponses({ form, responses }: FormSpecificResponsesProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (responseIds: string[]): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await deleteResponses(form.id, responseIds);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Responses deleted successfully',
        });
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete responses',
          variant: 'destructive',
        });
      }
      return result;
    } catch (error) {
      console.error('Error deleting responses:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{form.title}</h2>
          <p className="text-muted-foreground">{form.description}</p>
        </div>
        <Button onClick={() => router.push(`/forms/${form.id}`)}>
          Fill Form
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Responses</CardTitle>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <p className="text-muted-foreground">You haven't submitted any responses to this form yet.</p>
          ) : (
            <UserResponsesTable 
              responses={responses.map(response => ({ ...response, form }))} 
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
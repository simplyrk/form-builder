'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import type { Form, Response } from '@/types/form';
import { updateResponse } from '@/app/actions/forms';

interface EditResponseFormProps {
  form: Form;
  response: Response;
}

export function EditResponseForm({ form, response }: EditResponseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initialData: Record<string, string> = {};
    response.fields.forEach(field => {
      initialData[field.fieldId] = field.value;
    });
    return initialData;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateResponse(response.id, formData);
      toast({
        title: 'Success',
        description: 'Response updated successfully',
      });
      router.push('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update response',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit Response</h1>
        <p className="text-muted-foreground">
          Edit your response to {form.title}
        </p>
      </div>

      <div className="space-y-6">
        {form.fields.map(field => {
          const value = formData[field.id] || '';

          return (
            <div key={field.id} className="space-y-2">
              <label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <Textarea
                  value={value}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              ) : (
                <Input
                  type={field.type === 'date' ? 'date' : field.type}
                  value={value}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
} 
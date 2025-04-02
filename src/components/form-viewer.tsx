'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button"
import { FormField } from './form-field';
import { Form } from '@/types/form';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { submitResponse, updateResponse } from '@/app/actions/forms';

interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  order: number;
}

interface FormViewerProps {
  form: Form;
  initialData?: Record<string, any>;
  responseId?: string; // Add responseId for editing
}

export function FormViewer({ form, initialData = {}, responseId }: FormViewerProps) {
  // Initialize form data with initialData and only update when form changes
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const data: Record<string, any> = {};
    form.fields.forEach(field => {
      data[field.id] = initialData[field.id] || '';
    });
    return data;
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Memoize sorted fields to prevent unnecessary re-renders
  const sortedFields = useMemo(() => 
    form.fields.sort((a, b) => a.order - b.order),
    [form.fields]
  );

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate required fields
      const missingFields = sortedFields
        .filter(field => field.required)
        .filter(field => !formData[field.id]);

      if (missingFields.length > 0) {
        const errorMessage = `Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`;
        setError(errorMessage);
        toast({
          title: 'Validation Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      if (responseId) {
        // Update existing response
        await updateResponse(responseId, formData);
        toast({
          title: 'Success',
          description: 'Response updated successfully',
        });
      } else {
        // Create new response
        const result = await submitResponse(form.id, formData);
        if (!result.success) {
          throw new Error(result.error || 'Failed to submit form');
        }
        toast({
          title: 'Success',
          description: 'Form submitted successfully',
        });
      }

      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit form. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {sortedFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <FormField
              field={field}
              value={formData[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
              disabled={submitting}
            />
            {field.required && (
              <span className="text-xs text-muted-foreground">Required</span>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : (responseId ? 'Update Response' : 'Submit')}
        </Button>
      </div>
    </form>
  );
} 
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button"
import { FormField } from './form-field';
import { Form } from '@/types/form';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { submitResponse, updateResponse } from '@/app/actions/forms';

type FieldValue = {
  text: string;
  textarea: string;
  number: number;
  email: string;
  tel: string;
  url: string;
  select: string;
  multiselect: string[];
  checkbox: boolean;
  radio: string;
  file: File | null;
  date: string;
  time: string;
  datetime: string;
};

type ApiFormData = Record<string, string | number | boolean | null>;

interface FormViewerProps {
  form: Form;
  initialData?: Partial<Record<string, FieldValue[keyof FieldValue]>>;
  responseId?: string;
  onSubmit?: (data: Record<string, FieldValue[keyof FieldValue]>) => Promise<void>;
}

export function FormViewer({ form, initialData = {}, responseId, onSubmit }: FormViewerProps) {
  // Initialize form data with initialData and only update when form changes
  const [formData, setFormData] = useState<Record<string, FieldValue[keyof FieldValue]>>(() => {
    const data: Record<string, FieldValue[keyof FieldValue]> = {};
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

  const handleFieldChange = useCallback((fieldId: string, value: FieldValue[keyof FieldValue]) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // If an onSubmit prop is provided, use it
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Convert form data to the expected format
        const processedData: ApiFormData = {};
        for (const [key, value] of Object.entries(formData)) {
          if (value instanceof File) {
            // Handle file uploads separately
            const formDataObj = new FormData();
            formDataObj.append('file', value);
            // TODO: Implement file upload handling
            processedData[key] = null;
          } else if (Array.isArray(value)) {
            processedData[key] = value.join(',');
          } else if (typeof value === 'boolean') {
            processedData[key] = value;
          } else if (typeof value === 'number') {
            processedData[key] = value;
          } else {
            processedData[key] = value?.toString() || null;
          }
        }

        if (responseId) {
          await updateResponse(responseId, processedData);
        } else {
          await submitResponse(form.id, processedData);
        }

        toast({
          title: 'Success',
          description: responseId ? 'Response updated successfully' : 'Response submitted successfully',
        });
      }

      router.refresh();
    } catch (err) {
      console.error('Form submission error:', err);
      setError('Failed to submit the form. Please try again.');
      toast({
        title: 'Submission Error',
        description: 'Failed to submit the form. Please try again.',
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
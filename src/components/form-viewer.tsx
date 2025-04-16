'use client';

import React, { useState, useCallback, useMemo } from 'react';

import { useRouter } from 'next/navigation';

import { submitResponse, updateResponse } from '@/app/actions/forms';
import { Button } from "@/components/ui/button"
import { useToast } from '@/components/ui/use-toast';
import { Form } from '@/types/form';
import { log, error } from '@/utils/logger';

import { FormField } from './form-field';

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
  'datetime-local': string;
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

  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      log('Starting form submission...');
      // Use the formData state instead of creating a new FormData object
      // This ensures we're using the values from our controlled components
      const processedData: Record<string, string | string[] | File> = {};
      
      // Process all form fields from our state
      Object.entries(formData).forEach(([fieldId, value]) => {
        if (value instanceof File) {
          // For file uploads
          processedData[fieldId] = value;
        } else if (Array.isArray(value)) {
          // For array values (like checkboxes)
          processedData[fieldId] = value;
        } else if (value !== null && value !== undefined) {
          // For string values
          processedData[fieldId] = value.toString();
        }
      });

      log('Processed form data:', processedData);

      if (responseId) {
        log('Updating existing response...');
        // For updates, we need to use FormData for file uploads
        const formDataObj = new FormData();
        
        // Add all form fields to the FormData
        Object.entries(processedData).forEach(([fieldId, value]) => {
          if (value instanceof File) {
            formDataObj.append(fieldId, value);
          } else if (Array.isArray(value)) {
            value.forEach(v => formDataObj.append(fieldId, v));
          } else {
            formDataObj.append(fieldId, value);
          }
        });
        
        // Update existing response
        const result = await updateResponse(form.id, responseId, formDataObj);
        log('Update response result:', result);
        
        if (result.success) {
          toast({
            title: 'Success',
            description: 'Response updated successfully',
          });
          router.back();
        } else {
          throw new Error(result.error || 'Failed to update response');
        }
      } else {
        log('Submitting new response...');
        // Submit new response
        const result = await submitResponse(form.id, processedData);
        log('Submit response result:', result);
        
        if (result.success) {
          toast({
            title: 'Success',
            description: 'Response submitted successfully',
          });
          router.back();
        } else {
          throw new Error(result.error || 'Failed to submit response');
        }
      }
    } catch (err) {
      // Use direct console.error for logging to avoid TypeScript errors
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit response');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to submit response',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
              disabled={isSubmitting}
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (responseId ? 'Update Response' : 'Submit')}
        </Button>
      </div>
    </form>
  );
} 
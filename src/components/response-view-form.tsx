'use client';

import React from 'react';

import Link from 'next/link';

import { format } from 'date-fns';
import { ArrowLeft, FileIcon, ImageIcon, ExternalLink } from 'lucide-react';

import { LinkedSubmissionDisplay } from '@/components/linked-submission-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { Form, Response, FormField, ResponseField } from '@/types/form';

interface ResponseViewFormProps {
  form: Form;
  response: Response;
}

export function ResponseViewForm({ form, response }: ResponseViewFormProps) {
  // Format date for display
  const formatDate = (dateString: Date | string) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, 'PPpp'); // Format: Apr 29, 2023, 3:45 PM
  };

  // Get a field's response value
  const getFieldResponse = (fieldId: string) => {
    return response.fields.find(f => f.fieldId === fieldId);
  };

  // Render a field's value based on its type
  const renderFieldValue = (field: FormField, responseField?: ResponseField) => {
    if (!responseField) return <span className="text-muted-foreground italic">No response</span>;

    switch (field.type) {
      case 'file':
        if (!responseField.fileName && !responseField.value) {
          return <span className="text-muted-foreground italic">No file uploaded</span>;
        }

        const fileName = responseField.fileName || responseField.value;
        const filePath = responseField.filePath;
        const mimeType = responseField.mimeType || '';
        const isImage = mimeType.startsWith('image/');

        if (filePath) {
          return (
            <a 
              href={`/api/files/${filePath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:underline"
            >
              {isImage ? (
                <ImageIcon className="h-4 w-4 mr-2" />
              ) : (
                <FileIcon className="h-4 w-4 mr-2" />
              )}
              {fileName}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          );
        }
        
        return <span>{fileName}</span>;

      case 'checkbox':
        return responseField.value === 'true' ? 'Yes' : 'No';

      case 'multiselect':
        try {
          const values = JSON.parse(responseField.value);
          return Array.isArray(values) ? values.join(', ') : responseField.value;
        } catch {
          return responseField.value;
        }

      case 'linkedSubmission':
        if (!responseField.value) return <span className="text-muted-foreground italic">None selected</span>;
        
        return (
          <LinkedSubmissionDisplay
            value={responseField.value}
            formId={field.linkedFormId}
            displayStyle="simple"
          />
        );

      default:
        return responseField.value || <span className="text-muted-foreground italic">Empty</span>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="text-sm text-muted-foreground">
                Submitted: {formatDate(response.createdAt)}
              </div>
            </div>

            {form.fields.map((field) => {
              const responseField = getFieldResponse(field.id);
              
              return (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <div className="p-3 border rounded-md bg-background">
                    {renderFieldValue(field, responseField)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" asChild>
          <Link href={`/admin/forms/${form.id}/responses`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Responses
          </Link>
        </Button>
      </div>
    </div>
  );
}

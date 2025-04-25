'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageIcon, FileIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Form, FormField, Response, FormResponse, ResponseField } from '@/types/form';
import { updateResponse } from '@/app/actions/forms';
import { log, error } from '@/utils/logger';

// Isolated File Input Component
function FileInput({ 
  fieldId, 
  required, 
  onChange 
}: { 
  fieldId: string; 
  required: boolean; 
  onChange: (fieldId: string, file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="flex items-center space-x-2">
      <input
        ref={inputRef}
        type="file"
        id={`file-${fieldId}`}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onChange={(e) => onChange(fieldId, e.target.files?.[0] || null)}
        required={required}
      />
    </div>
  );
}

export interface ResponseEditFormProps {
  /** The form containing the response */
  form: Form;
  /** The response to edit */
  response: Response | FormResponse;
  /** Whether this form is being used in admin context */
  isAdmin?: boolean;
  /** Optional callback function to handle cancel */
  onCancel?: () => void;
}

export function ResponseEditForm({ form, response, isAdmin = false, onCancel }: ResponseEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize form data from response
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initialData: Record<string, unknown> = {};
    
    // First, initialize all fields with empty/default values
    form.fields.forEach(field => {
      if (field.type === 'checkbox') {
        initialData[field.id] = false;
      } else if (field.type === 'multiselect') {
        initialData[field.id] = [];
      } else if (field.type !== 'file') {
        initialData[field.id] = '';
      }
    });
    
    // Then, override with any existing response values
    response.fields.forEach((responseField) => {
      const formField = form.fields.find(f => f.id === responseField.fieldId);
      if (formField && formField.type !== 'file') {
        if (formField.type === 'checkbox') {
          initialData[responseField.fieldId] = responseField.value === 'true';
        } else if (formField.type === 'multiselect' && typeof responseField.value === 'string') {
          // Handle multiselect values that might be serialized
          try {
            initialData[responseField.fieldId] = JSON.parse(responseField.value);
          } catch {
            initialData[responseField.fieldId] = [];
          }
        } else {
          initialData[responseField.fieldId] = responseField.value;
        }
      }
    });
    
    return initialData;
  });
  
  const [fileData, setFileData] = useState<Record<string, File | null>>({});
  const [deletedFiles, setDeletedFiles] = useState<Set<string>>(new Set());
  const [showFileInput, setShowFileInput] = useState<Record<string, boolean>>({});

  // Initialize the showFileInput state based on the fields
  useEffect(() => {
    const initialShowFileInput: Record<string, boolean> = {};
    form.fields.forEach(field => {
      if (field.type === 'file') {
        initialShowFileInput[field.id] = true;
      }
    });
    setShowFileInput(initialShowFileInput);
  }, [form.fields]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSubmit = new FormData(e.currentTarget);
      
      // Add file data and deleted files information
      Object.entries(fileData).forEach(([fieldId, file]) => {
        if (file) {
          formDataToSubmit.append(fieldId, file);
        }
      });
      
      deletedFiles.forEach(fieldId => {
        formDataToSubmit.append(`delete_${fieldId}`, 'true');
      });

      if (isAdmin) {
        // Admin path - use fetch API
        const updateResponse = await fetch(`/api/forms/${form.id}/responses/${response.id}`, {
          method: 'PUT',
          body: formDataToSubmit,
        });

        if (!updateResponse.ok) {
          throw new Error(`Failed to update response: ${updateResponse.status}`);
        }

        toast.success('Response updated successfully');
      } else {
        // User path - use server action
        const result = await updateResponse(form.id, response.id, formDataToSubmit);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to update response');
        }
        
        toast.success('Response updated successfully');
      }
      
      // Navigate back or execute callback
      if (onCancel) {
        onCancel();
      } else {
        router.back();
        setTimeout(() => router.refresh(), 100);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the response');
      toast.error(err.message || 'Failed to update response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleFileChange = (fieldId: string, file: File | null) => {
    setFileData(prev => ({
      ...prev,
      [fieldId]: file
    }));
    
    // If a new file is uploaded, remove from deleted files
    if (file) {
      setDeletedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldId);
        return newSet;
      });
    }
  };
  
  const handleDeleteFile = (fieldId: string) => {
    // Add to deleted files set
    setDeletedFiles(prev => {
      const newSet = new Set(prev);
      newSet.add(fieldId);
      return newSet;
    });
    
    // Clear any uploaded file
    setFileData(prev => ({
      ...prev,
      [fieldId]: null
    }));
    
    // Toggle file input visibility to force re-render
    setShowFileInput(prev => ({
      ...prev,
      [fieldId]: false
    }));
    
    setTimeout(() => {
      setShowFileInput(prev => ({
        ...prev,
        [fieldId]: true
      }));
    }, 50);
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id];
    const responseField = response.fields.find(f => f.fieldId === field.id);
    const isRequired = field.required;
    const isFileDeleted = deletedFiles.has(field.id);

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'date':
      case 'time':
      case 'datetime-local':
        return (
          <Input
            type={field.type}
            id={field.id}
            name={field.id}
            value={value as string || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={isRequired}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.id}
            name={field.id}
            value={value as string || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={isRequired}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            id={field.id}
            name={field.id}
            value={value as string || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={isRequired}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              name={field.id}
              checked={!!value}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              required={isRequired}
            />
            <input type="hidden" name={field.id} value={value ? 'true' : 'false'} />
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={value as string || ''}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            name={field.id}
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'select':
      case 'picklist':
        return (
          <Select
            value={value as string || ''}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            name={field.id}
            required={isRequired}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option}`}
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value) ? [...value] : [];
                    if (checked) {
                      if (!currentValues.includes(option)) {
                        handleFieldChange(field.id, [...currentValues, option]);
                      }
                    } else {
                      handleFieldChange(field.id, currentValues.filter(v => v !== option));
                    }
                  }}
                />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                <input type="hidden" name={`${field.id}[]`} value={option} />
              </div>
            ))}
          </div>
        );

      case 'file':
        // For file fields, we need to handle both existing files and new uploads
        const fileValue = responseField?.value;
        return (
          <div className="space-y-2">
            {fileValue && !isFileDeleted ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 border p-2 rounded-md">
                  <FileIcon className="h-5 w-5" />
                  <span className="text-sm">{fileValue}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(field.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              showFileInput[field.id] && (
                <FileInput
                  fieldId={field.id}
                  required={isRequired && !fileValue}
                  onChange={handleFileChange}
                />
              )
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-6">
        {form.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            {renderField(field)}
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
} 
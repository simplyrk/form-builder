/**
 * Admin Edit Response Form Component
 * Allows administrators to edit any form response, including file uploads
 * @module admin-edit-response-form
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Form, FormField, FormResponse, ResponseField } from '@/types/form';
import { Label } from '@/components/ui/label';
import { ImageIcon, FileIcon, Trash2 } from 'lucide-react';

/**
 * Props for the AdminEditResponseForm component
 */
interface EditResponseFormProps {
  /** The form containing the response */
  form: Form;
  /** The response to edit */
  response: FormResponse;
  /** Callback function to handle cancel */
  onCancel?: () => void;
}

/**
 * AdminEditResponseForm Component
 * Provides a form interface for administrators to edit any form response, including file uploads
 * @param {EditResponseFormProps} props - The component props
 * @returns {JSX.Element} The rendered admin edit response form
 */
export const EditResponseForm = ({ form, response: initialResponse, onCancel }: EditResponseFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form data from response
  const [formData, setFormData] = useState<Record<string, string | string[] | File>>(() => {
    const initialData: Record<string, string | string[] | File> = {};
    initialResponse.fields.forEach((field: ResponseField) => {
      initialData[field.fieldId] = field.value || '';
    });
    return initialData;
  });

  /**
   * Handles form submission, including file uploads and deletions
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a FormData object to handle file uploads
      const submitFormData = new FormData();
      
      // Add all form fields to the FormData
      for (const [key, value] of Object.entries(formData)) {
        if (value instanceof File) {
          // Handle File objects directly
          submitFormData.append(key, value);
        } else if (typeof value === 'string') {
          // Handle string values
          submitFormData.append(key, value);
        } else if (Array.isArray(value)) {
          // Handle array values (like multiselect)
          value.forEach(item => submitFormData.append(key, item));
        }
      }
      
      console.log('Submitting form data:', Object.fromEntries(submitFormData.entries()));
      
      const updateResponse = await fetch(`/api/forms/${form.id}/responses/${initialResponse.id}`, {
        method: 'PUT',
        body: submitFormData,
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({}));
        console.error('Update failed with status:', updateResponse.status, 'Error:', errorData);
        throw new Error(`Failed to update response: ${updateResponse.status} ${updateResponse.statusText}`);
      }

      toast.success('Response updated successfully');
      router.refresh();
      
      // Only call onCancel if it's provided
      if (onCancel) {
        onCancel();
      } else {
        // If onCancel is not provided, navigate back to the responses page
        router.push(`/admin/forms/${form.id}/responses`);
      }
    } catch (error) {
      console.error('Error updating response:', error);
      toast.error('Failed to update response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        console.error('Upload failed with status:', uploadResponse.status, 'Error:', errorData);
        throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const data = await uploadResponse.json();
      console.log('Upload successful:', data);
      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id];
    const isRequired = field.required;

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
            value={value as string}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            required={isRequired}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value as string}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            required={isRequired}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            id={field.id}
            value={value as string}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            required={isRequired}
          />
        );

      case 'select':
        return (
          <Select
            value={value as string}
            onValueChange={(value) => setFormData({ ...formData, [field.id]: value })}
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
                  checked={(value as string[] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = (value as string[]) || [];
                    const newValues = checked
                      ? [...currentValues, option]
                      : currentValues.filter((v) => v !== option);
                    setFormData({ ...formData, [field.id]: newValues });
                  }}
                />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <Checkbox
            id={field.id}
            checked={value === 'true'}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, [field.id]: checked ? 'true' : 'false' })
            }
          />
        );

      case 'radio':
        return (
          <RadioGroup
            value={value as string}
            onValueChange={(value) => setFormData({ ...formData, [field.id]: value })}
            required={isRequired}
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'file':
        // Check if there's an existing file
        const existingFilePath = value as string;
        const fileName = formData[`${field.id}_fileName`] as string || '';
        const fileSize = formData[`${field.id}_fileSize`] as string || '';
        const mimeType = formData[`${field.id}_mimeType`] as string || '';
        
        return (
          <div className="space-y-3">
            {existingFilePath && (
              <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/30">
                {mimeType?.startsWith('image/') ? (
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <FileIcon className="h-5 w-5 text-gray-500" />
                )}
                <span className="text-sm">{fileName || 'File'}</span>
                <a 
                  href={`/api/files/${existingFilePath}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm hover:underline ml-auto"
                >
                  View
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormData({ 
                      ...formData, 
                      [field.id]: '',
                      [`${field.id}_fileName`]: '',
                      [`${field.id}_fileSize`]: '',
                      [`${field.id}_mimeType`]: ''
                    });
                  }}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <Input
              type="file"
              id={field.id}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const fileData = await handleFileUpload(file);
                    setFormData({ 
                      ...formData, 
                      [field.id]: fileData.filePath,
                      [`${field.id}_fileName`]: fileData.fileName,
                      [`${field.id}_fileSize`]: fileData.fileSize,
                      [`${field.id}_mimeType`]: fileData.mimeType
                    });
                    toast.success('File uploaded successfully');
                  } catch (error) {
                    console.error('Error handling file upload:', error);
                    toast.error('Failed to upload file');
                  }
                }
              }}
              required={isRequired && !existingFilePath}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {form.fields.map(field => {
          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderField(field)}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              router.push(`/admin/forms/${form.id}/responses`);
            }
          }}
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
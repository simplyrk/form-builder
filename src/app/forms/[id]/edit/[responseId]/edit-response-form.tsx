/**
 * Edit Response Form Component
 * Allows users to edit their form responses, including file uploads
 * @module edit-response-form
 */

'use client';

import { useState, useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { FileIcon, ImageIcon, Trash2, Plus } from 'lucide-react';

import { updateResponse } from '@/app/actions/forms';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import type { Form, Response, ResponseField } from '@/types/form';


// Remove unused FileUploadResponse type
type FormDataValue = string | number | boolean | string[] | File | null;

type FileFieldState = {
  id: string;
  file: File | null;
  deleteExisting: boolean;
  currentFile?: {
    name: string;
    path: string;
    mimeType?: string;
  };
};

/**
 * Props for the EditResponseForm component
 */
interface EditResponseFormProps {
  /** The form containing the response */
  form: Form;
  /** The response to edit */
  response: Response;
}

/**
 * EditResponseForm Component
 * Provides a form interface for editing form responses, including file uploads
 * @param {EditResponseFormProps} props - The component props
 * @returns {JSX.Element} The rendered edit response form
 */
export function EditResponseForm({ form, response }: EditResponseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, FormDataValue>>(() => {
    const initialData: Record<string, FormDataValue> = {};
    response.fields.forEach((responseField: ResponseField) => {
      const formField = form.fields.find(f => f.id === responseField.fieldId);
      if (formField && formField.type !== 'file') {
        initialData[responseField.fieldId] = responseField.value;
      }
    });
    return initialData;
  });
  const [fileFields, setFileFields] = useState<Record<string, FileFieldState>>(() => {
    const fields: Record<string, FileFieldState> = {};
    form.fields.forEach(field => {
      if (field.type === 'file') {
        const responseField = response.fields.find((rf: ResponseField) => rf.fieldId === field.id);
        fields[field.id] = {
          id: field.id,
          file: null,
          deleteExisting: false,
          currentFile: responseField?.filePath ? {
            name: responseField.fileName || 'File',
            path: responseField.filePath,
            mimeType: responseField.mimeType || undefined
          } : undefined
        };
      }
    });
    return fields;
  });

  /**
   * Handles form submission, including file uploads and deletions
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateResponse(form.id, response.id, formData);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Response updated successfully',
        });
        // Go back to the previous page
        router.back();
        // Add a small delay before refreshing
        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        setError(result.error || 'Failed to update response');
      }
    } catch (err) {
      setError('An error occurred while updating the response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Go back to the previous page
    router.back();
    // Add a small delay before refreshing
    setTimeout(() => {
      router.refresh();
    }, 100);
  };

  const handleFieldChange = (fieldId: string, value: FormDataValue) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };
  
  /**
   * Handles file upload for a specific field
   * @param {string} fieldId - The ID of the field to upload a file for
   * @param {File} file - The file to upload
   */
  const handleFileChange = (fieldId: string, file: File | null) => {
    if (file) {
      // Update the file in fileFields
      setFileFields(prev => {
        const update = { ...prev };
        
        update[fieldId] = {
          ...update[fieldId],
          file,
          deleteExisting: false
        };
        
        return update;
      });
    } else {
      // Clear the file from fileFields
      setFileFields(prev => {
        const update = { ...prev };
        
        update[fieldId] = {
          ...update[fieldId],
          file: null
        };
        
        return update;
      });
    }
  };

  /**
   * Handles file deletion for a specific field
   * @param {string} fieldId - The ID of the field to delete the file from
   */
  const handleFileDelete = useCallback((fieldId: string) => {
    setFileFields(prev => {
      const update = { ...prev };
      
      update[fieldId] = {
        ...update[fieldId],
        deleteExisting: true,
        file: null
      };
      
      return update;
    });
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {form.fields.map(field => {
          const value = formData[field.id] || '';
          
          // Special handling for file fields
          if (field.type === 'file') {
            const fileField = fileFields[field.id];
            const hasCurrentFile = fileField?.currentFile && !fileField.deleteExisting;
            const hasNewFile = !!fileField?.file;
            const isRequired = field.required && !hasCurrentFile && !hasNewFile;
            
            return (
              <div key={field.id} className="space-y-2">
                <label className="text-sm font-medium">
                  {field.label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                <div className="space-y-3">
                  {/* Show current file if exists */}
                  {hasCurrentFile && (
                    <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/30">
                      {fileField.currentFile?.mimeType?.startsWith('image/') ? (
                        <ImageIcon className="h-5 w-5 text-blue-500" />
                      ) : (
                        <FileIcon className="h-5 w-5 text-gray-500" />
                      )}
                      <span className="text-sm">{fileField.currentFile?.name}</span>
                      <a 
                        href={(() => {
                          // Get the file path and ensure it doesn't have a leading slash
                          const filePath = fileField.currentFile?.path || '';
                          
                          // Return the URL path properly formatted
                          return `/api/files/${filePath}`;
                        })()} 
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
                        onClick={() => handleFileDelete(field.id)}
                        className="h-8 px-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Show new file if uploaded */}
                  {hasNewFile && (
                    <div className="flex items-center space-x-2 p-3 border rounded-md bg-green-50">
                      <FileIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm">{fileField.file?.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileDelete(field.id)}
                        className="h-8 px-2 text-destructive hover:text-destructive ml-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Show upload button if no file or file deleted */}
                  {!hasNewFile && (
                    <div className="relative">
                      <input
                        type="file"
                        id={`file-${field.id}`}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
                            handleFileChange(field.id, file);
                          }
                        }}
                        required={isRequired}
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        className="w-full flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {fileField.deleteExisting ? 'Replace deleted file' : 'Upload new file'}
                      </Button>
                    </div>
                  )}
                  
                  {fileField.deleteExisting && !hasNewFile && (
                    <p className="text-sm text-amber-600">
                      The existing file will be deleted when you save changes
                    </p>
                  )}
                </div>
              </div>
            );
          }
          
          // Handle other field types
          return (
            <div key={field.id} className="space-y-2">
              <label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.type === 'textarea' && (
                <Textarea
                  value={value as string}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
              
              {field.type === 'text' && (
                <Input
                  type="text"
                  value={value as string}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
              
              {field.type === 'checkbox' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={value as boolean || false}
                    onCheckedChange={(checked) => 
                      handleFieldChange(field.id, !!checked)
                    }
                  />
                  <label htmlFor={field.id} className="text-sm">
                    {field.label}
                  </label>
                </div>
              )}
              
              {field.type === 'radio' && field.options && (
                <RadioGroup
                  value={value as string}
                  onValueChange={(value) => handleFieldChange(field.id, value)}
                  required={field.required}
                >
                  {field.options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                      <label htmlFor={`${field.id}-${option}`} className="text-sm">
                        {option}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {field.type === 'select' && field.options && (
                <Select
                  value={value as string}
                  onValueChange={(value) => handleFieldChange(field.id, value)}
                  required={field.required}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
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
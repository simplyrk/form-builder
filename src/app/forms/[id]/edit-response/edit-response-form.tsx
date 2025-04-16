'use client';

import { useState, useRef, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { FileIcon, Trash2 } from 'lucide-react';

import { updateResponse } from '@/app/actions/forms';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import type { Form, Response } from '@/types/form';

type FormDataValue = string | number | boolean | string[] | File | null;

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
  // Use a ref to access the file input directly
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

interface EditResponseFormProps {
  form: Form;
  response: Response;
}

export function EditResponseForm({ form, response }: EditResponseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, FormDataValue>>(() => {
    const initialData: Record<string, FormDataValue> = {};
    response.fields.forEach((responseField) => {
      const formField = form.fields.find(f => f.id === responseField.fieldId);
      if (formField && formField.type !== 'file') {
        initialData[responseField.fieldId] = responseField.value;
      }
    });
    return initialData;
  });
  const [fileData, setFileData] = useState<Record<string, File | null>>({});
  const [deletedFiles, setDeletedFiles] = useState<Set<string>>(new Set());
  // Track which file fields should be rendered
  const [showFileInput, setShowFileInput] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

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
      const formData = new FormData(e.currentTarget);
      const result = await updateResponse(form.id, response.id, formData);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Response updated successfully',
        });
        // Go back to the previous page
        window.history.back();
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
    window.history.back();
  };

  const handleFieldChange = (fieldId: string, value: string | boolean | string[]) => {
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
    
    // Force re-render the file input by toggling its state
    setShowFileInput(prev => ({
      ...prev,
      [fieldId]: false
    }));
    
    // Re-show the file input after a brief delay
    setTimeout(() => {
      setShowFileInput(prev => ({
        ...prev,
        [fieldId]: true
      }));
    }, 50);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {form.fields.map((field) => {
        const responseField = response.fields.find(f => f.fieldId === field.id);
        const currentValue = formData[field.id];
        const isFileDeleted = deletedFiles.has(field.id);

        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}</Label>
            {field.type === 'text' && (
              <Input
                type="text"
                value={currentValue as string || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                required={field.required}
              />
            )}
            {field.type === 'textarea' && (
              <Textarea
                value={currentValue as string || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                required={field.required}
              />
            )}
            {field.type === 'checkbox' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.id}
                  checked={currentValue as boolean || false}
                  onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
                />
                <Label htmlFor={field.id}>{field.label}</Label>
              </div>
            )}
            {field.type === 'radio' && field.options && (
              <RadioGroup
                value={currentValue as string || ''}
                onValueChange={(value) => handleFieldChange(field.id, value)}
                required={field.required}
              >
                {field.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                    <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            {field.type === 'select' && field.options && (
              <Select
                value={currentValue as string || ''}
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
            {field.type === 'file' && (
              <div className="space-y-2">
                {responseField?.filePath && !isFileDeleted && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <FileIcon className="h-4 w-4" />
                    <span>Current file: {responseField.fileName}</span>
                    <a
                      href={(() => {
                        // Get the file path and ensure it doesn't have a leading slash
                        const filePath = responseField.filePath || '';
                        
                        // Return the URL path properly formatted
                        return `/api/files/${filePath}`;
                      })()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View
                    </a>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => handleDeleteFile(field.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
                {isFileDeleted && (
                  <div className="text-sm text-amber-600">
                    File will be removed when you save changes
                  </div>
                )}
                {showFileInput[field.id] && (
                  <FileInput 
                    key={`file-input-${field.id}-${Date.now()}`}
                    fieldId={field.id}
                    required={field.required && !responseField?.filePath && !isFileDeleted}
                    onChange={handleFileChange}
                  />
                )}
                <p className="text-sm text-gray-500">
                  {field.required && !responseField?.filePath && !isFileDeleted
                    ? 'Please upload a new file'
                    : 'Leave empty to keep the current file'}
                </p>
              </div>
            )}
          </div>
        );
      })}
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
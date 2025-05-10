/**
 * Response Edit Form Component
 * 
 * This component provides a form for editing responses to forms in the application.
 * It supports both user and admin contexts, and handles various form field types
 * including text, textarea, checkbox, radio, select, multiselect, and file uploads.
 * 
 * Special features:
 * - Comprehensive file upload handling with camera integration
 * - Support for multiple file types (images, PDFs, office documents)
 * - Form validation
 * - Admin/user mode with different save behaviors
 * 
 * @module response-edit-form
 */

'use client';

import { useState, useRef, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { ImageIcon, FileIcon, Trash2, Camera } from 'lucide-react';
import { toast } from 'sonner';

import { updateResponse } from '@/app/actions/forms';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Form, FormField, Response, FormResponse, ResponseField } from '@/types/form';
import { log, error } from '@/utils/logger';

/**
 * FileInput Component
 * 
 * A specialized file input component that supports both traditional file selection
 * and direct camera capture functionality for images.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.fieldId - The ID of the form field this input is for
 * @param {boolean} props.required - Whether the field is required
 * @param {Function} props.onChange - Callback function when a file is selected/captured
 * @returns {JSX.Element} The rendered file input with camera support
 */
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
  
  // List of allowed file types from the configuration (should match server-side)
  const allowedFileTypes = 'image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  
  /**
   * Handles camera capture process including permission requests,
   * camera stream setup, UI for preview, and image capture.
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const handleCameraCapture = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Camera access is not supported in your browser. Please try using a modern browser.");
        return;
      }

      // For Chrome, first enumerate devices to trigger permission prompt
      await navigator.mediaDevices.enumerateDevices();

      // Request camera access with specific constraints for Chrome
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      // Create video element to show preview
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      
      // Create a modal/dialog to show the camera preview
      const dialog = document.createElement('dialog');
      dialog.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50';
      
      const container = document.createElement('div');
      container.className = 'bg-white p-4 rounded-lg shadow-lg space-y-4 max-w-md w-full';
      
      // Add video container with proper sizing
      const videoContainer = document.createElement('div');
      videoContainer.className = 'relative aspect-video bg-black rounded-lg overflow-hidden';
      video.className = 'w-full h-full object-cover';
      videoContainer.appendChild(video);
      
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'flex justify-center space-x-4 mt-4';
      
      const captureBtn = document.createElement('button');
      captureBtn.textContent = 'Take Photo';
      captureBtn.className = 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Cancel';
      closeBtn.className = 'px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-medium';
      
      buttonContainer.appendChild(captureBtn);
      buttonContainer.appendChild(closeBtn);
      
      container.appendChild(videoContainer);
      container.appendChild(buttonContainer);
      dialog.appendChild(container);
      document.body.appendChild(dialog);

      // Make sure video is ready before showing dialog
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play().catch(console.error);
          resolve(true);
        };
      });
      
      dialog.showModal();
      
      const cleanup = () => {
        stream.getTracks().forEach(track => {
          track.stop();
          stream.removeTrack(track);
        });
        video.srcObject = null;
        dialog.remove();
      };
      
      closeBtn.onclick = () => {
        cleanup();
      };

      dialog.addEventListener('close', () => {
        cleanup();
      });
      
      captureBtn.onclick = () => {
        try {
          // Create a canvas to capture the image
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          
          // Convert the canvas to a file
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
              console.log('Captured file:', file);
              onChange(fieldId, file);
            }
            cleanup();
          }, 'image/jpeg', 0.9);
        } catch (error) {
          console.error('Error capturing photo:', error);
          cleanup();
        }
      };
    } catch (error) {
      console.error('Error accessing camera:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast.error("Camera access was denied. Please allow camera access in your browser settings and try again.");
      } else if (error instanceof DOMException && error.name === 'NotFoundError') {
        toast.error("No camera found. Please make sure your device has a working camera.");
      } else if (error instanceof DOMException && error.name === 'NotReadableError') {
        toast.error("Your camera might be in use by another application. Please close other apps using the camera and try again.");
      } else {
        toast.error("Could not access camera. Please make sure you have a working camera and try again.");
      }
    }
  };

  // Get the field configuration based on the field ID
  const fieldConfig = document.getElementById(`file-${fieldId}`)?.getAttribute('data-field-config');
  let acceptTypes = allowedFileTypes; // Default to all allowed types
  let showCamera = true; // Default to showing camera button
  
  if (fieldConfig) {
    try {
      const config = JSON.parse(fieldConfig);
      if (config.acceptOnly) {
        acceptTypes = config.acceptOnly;
      }
      if (config.noCamera) {
        showCamera = false;
      }
    } catch (e) {
      console.error('Error parsing field config:', e);
    }
  }
  
  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1">
        <input
          ref={inputRef}
          type="file"
          id={`file-${fieldId}`}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => onChange(fieldId, e.target.files?.[0] || null)}
          required={required}
          accept="*/*"
        />
      </div>
      {showCamera && (
        <Button
          type="button"
          variant="outline"
          onClick={handleCameraCapture}
          className="flex items-center space-x-1 whitespace-nowrap"
        >
          <Camera className="h-4 w-4 mr-1" />
          <span>Camera</span>
        </Button>
      )}
    </div>
  );
}

/**
 * ResponseEditForm Props Interface
 * 
 * @interface ResponseEditFormProps
 * @property {Form} form - The form containing the response
 * @property {Response | FormResponse} response - The response to edit
 * @property {boolean} [isAdmin] - Whether this form is being used in admin context
 * @property {() => void} [onCancel] - Optional callback function to handle cancel
 */
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

/**
 * Main form component for editing responses
 * 
 * This component provides a comprehensive form UI for editing responses,
 * supporting various field types and both admin and user contexts.
 * 
 * @component
 * @param {ResponseEditFormProps} props - Component props
 * @returns {JSX.Element} The rendered form
 */
export function ResponseEditForm({ form, response, isAdmin = false, onCancel }: ResponseEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Initialize form data from response
   * Creates a record of field IDs to their values, handling different field types appropriately
   */
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
  
  // Track file uploads and deletions
  const [fileData, setFileData] = useState<Record<string, File | null>>({});
  const [deletedFiles, setDeletedFiles] = useState<Set<string>>(new Set());

  /**
   * Handles form submission, including file uploads
   * Supports both admin and user contexts with different submission methods
   * 
   * @async
   * @function
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
   * @returns {Promise<void>}
   */
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
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the response';
      setError(errorMessage);
      toast.error(errorMessage || 'Failed to update response');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles form cancellation
   * Will use provided onCancel callback if available, otherwise navigates back
   * 
   * @function
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  /**
   * Updates form data when a field value changes
   * 
   * @function
   * @param {string} fieldId - The ID of the field to update
   * @param {unknown} value - The new value for the field
   */
  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  /**
   * Handles file uploads for a specific field
   * 
   * @function
   * @param {string} fieldId - The ID of the field to update
   * @param {File | null} file - The file to upload
   */
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
  
  /**
   * Handles file deletion for a specific field
   * 
   * @function
   * @param {string} fieldId - The ID of the field to delete the file from
   */
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
    
    // Clear the file input value by resetting the input
    setTimeout(() => {
      const fileInput = document.getElementById(`file-${fieldId}`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }, 50);
  };

  /**
   * Renders the appropriate input element based on field type
   * Supports various field types including text, textarea, checkbox, 
   * radio, select, multiselect, and file uploads
   * 
   * @function
   * @param {FormField} field - The field to render
   * @returns {JSX.Element | null} The rendered field component
   */
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
        const uploadedFile = fileData[field.id]; // Newly uploaded file
        const isFileDeleted = deletedFiles.has(field.id);
        
        // Use the values from the newly uploaded file if available, otherwise from the response
        const fileName = uploadedFile ? uploadedFile.name : (responseField?.fileName || responseField?.value || '');
        const filePath = responseField?.filePath || '';
        const mimeType = uploadedFile ? uploadedFile.type : (responseField?.mimeType || '');
        const isImage = mimeType.startsWith('image/');
        
        // Get the appropriate icon color based on MIME type
        let iconColor = "";
        if (mimeType.includes('pdf')) {
          iconColor = "text-red-500";
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
          iconColor = "text-blue-500";
        } else if (mimeType.includes('excel') || mimeType.includes('sheet')) {
          iconColor = "text-green-500";
        }

        return (
          <div className="space-y-2">
            {/* Show either the existing file or the newly uploaded file */}
            {((responseField && !isFileDeleted) || uploadedFile) ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 border p-2 rounded-md">
                  {isImage ? (
                    <ImageIcon className="h-5 w-5" />
                  ) : (
                    <FileIcon className={`h-5 w-5 ${iconColor}`} />
                  )}
                  <span className="text-sm">{fileName}</span>
                  
                  {/* Only show View link for existing files that haven't been deleted */}
                  {responseField && !isFileDeleted && !uploadedFile && (
                    <a
                      href={(() => {
                        // Get the file path and ensure it doesn't have a leading slash
                        const cleanPath = filePath.replace(/^api\/files\//, '');
                        
                        // Return the URL path properly formatted
                        return `/api/files/${cleanPath}`;
                      })()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View
                    </a>
                  )}
                  
                  {/* For newly uploaded files, show "New File" instead of view link */}
                  {uploadedFile && (
                    <span className="text-green-500 text-xs font-medium">New File</span>
                  )}
                  
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
              <FileInput
                fieldId={field.id}
                required={isRequired && !responseField?.value}
                onChange={handleFileChange}
              />
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

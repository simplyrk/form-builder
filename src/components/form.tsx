import { useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { X, Camera, FileIcon } from 'lucide-react';


import { submitResponse } from '@/app/actions/forms';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import type { Form, Field } from '@/types/form';


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

interface FormProps {
  form: Form;
}

// Custom File Input Component
function CustomFileInput({ 
  id, 
  required, 
  onChange 
}: { 
  id: string; 
  required: boolean; 
  onChange: (file: File | null) => void;
}) {
  const [fileName, setFileName] = useState<string>('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileName(file?.name || '');
    onChange(file);
  };
  
  const handleDocumentClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = "image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setFileName(file?.name || '');
      onChange(file);
    };
    input.click();
  };
  
  const handleCameraClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create video element to show preview
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      
      // Create a modal/dialog to show the camera preview
      const dialog = document.createElement('dialog');
      dialog.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70';
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-label', 'Camera');
      
      const container = document.createElement('div');
      container.className = 'bg-card p-4 rounded-lg shadow-lg space-y-4 max-w-md w-full border border-border/40 text-card-foreground';
      
      // Remove any heading/title that might be added by the browser
      const heading = document.createElement('div');
      heading.className = 'hidden';
      container.appendChild(heading);
      
      const captureBtn = document.createElement('button');
      captureBtn.textContent = 'Capture';
      captureBtn.className = 'px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      closeBtn.className = 'px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 ml-2';
      
      container.appendChild(video);
      container.appendChild(captureBtn);
      container.appendChild(closeBtn);
      dialog.appendChild(container);
      document.body.appendChild(dialog);
      
      dialog.showModal();
      
      const cleanup = () => {
        stream.getTracks().forEach(track => track.stop());
        dialog.remove();
      };
      
      closeBtn.onclick = cleanup;
      
      captureBtn.onclick = () => {
        // Create a canvas to capture the image but don't display preview
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        // Convert the canvas to a file without showing preview
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            setFileName(file.name);
            onChange(file);
          }
          cleanup(); // Close camera dialog immediately
        }, 'image/jpeg');
      };
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please make sure you have granted camera permissions.');
    }
  };
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <div className="flex items-center border border-border/60 rounded-md overflow-hidden">
            <div className="flex-1 p-2 bg-muted/30 text-sm text-muted-foreground">
              {fileName || 'No file chosen'}
            </div>
          </div>
          <input
            id={id}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            required={required}
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*"
          />
        </div>
        <Button
          type="button"
          onClick={handleDocumentClick}
          variant="outline"
          className="flex items-center space-x-1"
        >
          <FileIcon className="h-4 w-4 mr-1" />
          <span>Browse</span>
        </Button>
        <Button
          type="button"
          onClick={handleCameraClick}
          variant="outline"
          className="flex items-center space-x-1"
        >
          <Camera className="h-4 w-4 mr-1" />
          <span>Camera</span>
        </Button>
      </div>
    </div>
  );
}

export function Form({ form }: FormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, FieldValue[keyof FieldValue]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert form data to the expected format
      const processedData: Record<string, string | string[] | File> = {};
      for (const [key, value] of Object.entries(formData)) {
        if (value instanceof File) {
          processedData[key] = value;
        } else if (Array.isArray(value)) {
          processedData[key] = value;
        } else if (typeof value === 'boolean') {
          processedData[key] = value ? 'true' : 'false';
        } else if (typeof value === 'number') {
          processedData[key] = value.toString();
        } else if (value !== null && value !== undefined) {
          processedData[key] = value.toString();
        } else {
          processedData[key] = '';
        }
      }

      const result = await submitResponse(form.id, processedData);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Your response has been submitted successfully.',
        });
        router.push('/');
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to submit response',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: FieldValue[keyof FieldValue]) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleFileChange = (fieldId: string, file: File | null) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fieldId]: file,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [fieldId]: null,
      }));
    }
  };

  const renderField = (field: Field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'number':
      case 'date':
      case 'time':
      case 'datetime-local':
        return (
          <Input
            type={field.type}
            id={field.id}
            required={field.required}
            onChange={e => handleFieldChange(field.id, e.target.value as FieldValue[keyof FieldValue])}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            required={field.required}
            onChange={e => handleFieldChange(field.id, e.target.value as FieldValue[keyof FieldValue])}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            id={field.id}
            onCheckedChange={checked => handleFieldChange(field.id, checked as FieldValue[keyof FieldValue])}
          />
        );
      case 'radio':
        return (
          <RadioGroup onValueChange={(value: string) => handleFieldChange(field.id, value as FieldValue[keyof FieldValue])}>
            {field.options?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'select':
        return (
          <Select onValueChange={value => handleFieldChange(field.id, value as FieldValue[keyof FieldValue])}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'file':
        return (
          <div className="space-y-2">
            <CustomFileInput
              id={field.id}
              required={field.required}
              onChange={(file) => handleFileChange(field.id, file)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {form.fields.map(field => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderField(field)}
          </div>
        ))}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
} 
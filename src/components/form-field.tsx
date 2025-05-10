'use client';

// External imports
import Image from 'next/image';

import { Camera, X } from 'lucide-react';

// UI component imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from '@/types/form';

// Add FieldValue and FieldType type definitions

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
  picklist: string;
};

type FieldType = keyof FieldValue;

/**
 * Props for the FormField component.
 * 
 * @property field - The field configuration object containing type, id, label, etc.
 * @property value - The current value of the field, typed according to the field type
 * @property onChange - Callback function to handle value changes
 * @property disabled - Optional flag to disable the field input
 */
interface FormFieldProps {
  field: Field;
  value: FieldValue[FieldType];
  onChange: (value: FieldValue[FieldType]) => void;
  disabled?: boolean;
}

// Custom File Input Component
function CustomFileInput({ 
  id, 
  required, 
  onChange,
  disabled
}: { 
  id: string; 
  required: boolean;
  disabled?: boolean;
  onChange: (file: File | null) => void;
}) {
  const handleCameraClick = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera access is not supported in your browser. Please try using a modern browser.');
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
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-label', 'Camera');
      
      const container = document.createElement('div');
      container.className = 'bg-white p-4 rounded-lg shadow-lg space-y-4 max-w-md w-full';
      
      // Remove any heading/title that might be added by the browser
      const heading = document.createElement('div');
      heading.className = 'hidden';
      container.appendChild(heading);
      
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
          // Create a canvas to capture the image but don't display it
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          
          // Convert the canvas to a file without showing preview
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
              console.log('Captured file:', file);
              onChange(file);
            }
            cleanup(); // Close the camera dialog immediately
          }, 'image/jpeg', 0.9);
        } catch (error) {
          console.error('Error capturing photo:', error);
          cleanup();
        }
      };
    } catch (error) {
      console.error('Error accessing camera:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        alert('Camera access was denied. Please allow camera access in your browser settings and try again.\n\nIn Chrome: Settings > Privacy and security > Site Settings > Camera');
      } else if (error instanceof DOMException && error.name === 'NotFoundError') {
        alert('No camera found. Please make sure your device has a working camera.');
      } else if (error instanceof DOMException && error.name === 'NotReadableError') {
        alert('Your camera might be in use by another application. Please close other apps using the camera and try again.');
      } else {
        alert('Could not access camera. Please make sure you have a working camera and try again.');
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1">
        <Input
          id={id}
          type="file"
          className="w-full"
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          required={required}
          disabled={disabled}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleCameraClick}
        disabled={disabled}
        className="flex items-center space-x-1"
      >
        <Camera className="h-4 w-4" />
        <span>Camera</span>
      </Button>
    </div>
  );
}

/**
 * FormField component that renders different input fields based on the field type.
 * Supports various input types including text, textarea, select, email, number, etc.
 * 
 * @param props - The component props (see FormFieldProps interface)
 * @returns A form field component with appropriate input type and validation
 */
export function FormField({ field, value, onChange, disabled = false }: FormFieldProps) {
  /**
   * Renders the appropriate input element based on the field type.
   * 
   * @returns The rendered input element
   */
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value as FieldValue['text'])}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value as FieldValue['textarea'])}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'select':
        return (
          <Select
            value={value as string || ''}
            onValueChange={(value) => onChange(value as FieldValue['select'])}
            required={field.required}
            disabled={disabled}
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
      case 'picklist':
        return (
          <Select
            value={value as string || ''}
            onValueChange={(value) => onChange(value as FieldValue['picklist'])}
            required={field.required}
            disabled={disabled}
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
      case 'email':
        return (
          <Input
            type="email"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value as FieldValue['email'])}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value as number || ''}
            onChange={(e) => onChange(Number(e.target.value) as FieldValue['number'])}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value as FieldValue['date'])}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'file':
        return (
          <div className="space-y-2">
            <CustomFileInput
              id={field.id}
              required={field.required}
              disabled={disabled}
              onChange={(file) => {
                onChange(file);
              }}
            />
          </div>
        );
      default:
        return (
          <Input
            type={field.type}
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value as FieldValue[FieldType])}
            required={field.required}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {field.helpText && (
        <p className="text-sm text-muted-foreground mt-1">{field.helpText}</p>
      )}
    </div>
  );
} 
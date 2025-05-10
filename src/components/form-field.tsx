'use client';

// External imports
import React, { useRef, useState } from 'react';
import Image from 'next/image';

import { Camera, X, ImageIcon, FileIcon, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  
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
              // Create a filename with date and time to make it unique and descriptive
              const now = new Date();
              const formattedDate = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
              const formattedTime = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
              const filename = `camera-photo_${formattedDate}_${formattedTime}.jpg`;
              
              const file = new File([blob], filename, { type: 'image/jpeg' });
              console.log('Captured file:', file);
              
              // Set the value on the file input element to show the filename
              if (inputRef.current) {
                // Create a DataTransfer object to set the file on the input
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                inputRef.current.files = dataTransfer.files;
                
                // Trigger change event to ensure UI updates
                const event = new Event('change', { bubbles: true });
                inputRef.current.dispatchEvent(event);
              }
              
              // Also call the onChange handler
              setCapturedFile(file);
              onChange(file);
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
  const fieldConfig = document.getElementById(`file-${id}`)?.getAttribute('data-field-config');
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
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            id={`file-${id}`}
            type="file"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setCapturedFile(file); // Update state for non-camera files too
              onChange(file);
            }}
            required={required}
            disabled={disabled}
            accept={acceptTypes}
          />
        </div>
        {showCamera && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCameraCapture}
            disabled={disabled}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <Camera className="h-4 w-4 mr-1" />
            <span>Camera</span>
          </Button>
        )}
      </div>
      
      {/* Show explicit confirmation when a file is captured */}
      {capturedFile && (
        <div className="mt-2 flex items-center p-2 bg-green-50 border border-green-200 rounded-md text-green-700">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-sm font-medium">
            Photo captured: {capturedFile.name}
          </span>
        </div>
      )}
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
'use client';

import React, { useState } from 'react';

import { Camera, Upload, FileText } from 'lucide-react';

interface CustomFileInputProps {
  id: string;
  required?: boolean;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

/**
 * CustomFileInput Component
 * 
 * A simplified file input component with camera capture support
 * Allows uploading all supported file types including PDFs and Office documents
 * 
 * @component
 */
export function CustomFileInput({ id, required = false, onChange, disabled = false }: CustomFileInputProps) {
  const [fileName, setFileName] = useState<string>('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileName(file?.name || '');
    onChange(file);
  };
  
  const handleCameraClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    // Only set accept for camera to capture images
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setFileName(file?.name || '');
      onChange(file);
    };
    input.click();
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
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <div className="flex items-center border border-border/60 rounded-md overflow-hidden">
            <div className="flex-1 p-2 bg-muted/30 text-sm text-muted-foreground">
              {fileName ? fileName : 'No file chosen'}
            </div>
          </div>
          <input
            id={id}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            required={required}
            disabled={disabled}
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*"
          />
        </div>
        <button
          type="button"
          onClick={handleDocumentClick}
          disabled={disabled}
          className="px-3 py-2 bg-card border border-border/60 rounded-md hover:bg-muted/30 flex items-center space-x-1 text-sm font-medium text-foreground"
        >
          <FileText className="h-4 w-4 mr-1" />
          <span>Browse</span>
        </button>
        <button
          type="button"
          onClick={handleCameraClick}
          disabled={disabled}
          className="px-3 py-2 bg-card border border-border/60 rounded-md hover:bg-muted/30 flex items-center space-x-1 text-sm font-medium text-foreground"
        >
          <Camera className="h-4 w-4 mr-1" />
          <span>Camera</span>
        </button>
      </div>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';

import { Camera } from 'lucide-react';

interface CustomFileInputProps {
  id: string;
  required?: boolean;
  onChange: (file: File | null) => void;
}

export function CustomFileInput({ id, required = false, onChange }: CustomFileInputProps) {
  const [fileName, setFileName] = useState<string>('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileName(file?.name || '');
    onChange(file);
  };
  
  const handleCameraClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
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
          <div className="flex items-center border rounded-md overflow-hidden">
            <div className="flex-1 p-2 bg-gray-50 text-sm text-gray-500">
              {fileName || 'No file chosen'}
            </div>
            <label 
              htmlFor={id}
              className="px-4 py-2 bg-white border-l cursor-pointer hover:bg-gray-50 text-sm font-medium"
            >
              Browse
            </label>
          </div>
          <input
            id={id}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            required={required}
            accept="image/*"
          />
        </div>
        <button
          type="button"
          onClick={handleCameraClick}
          className="px-3 py-2 bg-white border rounded-md hover:bg-gray-50 flex items-center space-x-1 text-sm font-medium"
        >
          <Camera className="h-4 w-4" />
          <span>Camera</span>
        </button>
      </div>
    </div>
  );
} 
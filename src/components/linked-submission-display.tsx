'use client';

import React from 'react';

import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface LinkedSubmissionDisplayProps {
  value: string;
  displayValue?: string;
  onRemove?: () => void;
  disabled?: boolean;
}

export function LinkedSubmissionDisplay({
  value,
  displayValue,
  onRemove,
  disabled = false,
}: LinkedSubmissionDisplayProps) {
  return (
    <div className="flex items-center gap-2 p-2 border rounded-md bg-secondary/50">
      <div className="flex-grow overflow-hidden">
        <p className="text-sm font-medium truncate">
          {displayValue || value}
        </p>
      </div>
      
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      )}
    </div>
  );
} 
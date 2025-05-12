'use client';

import React, { useState } from 'react';

import { Trash2, ExternalLink, Loader2, FileIcon, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface LinkedSubmissionDisplayProps {
  value: string;
  displayValue?: string;
  onRemove?: () => void;
  disabled?: boolean;
  formId?: string;
  displayStyle?: 'simple' | 'box'; // Add display style prop
}

interface SubmissionField {
  id: string;
  label: string;
  type: string;
  value: string;
  fileName?: string | null;
  filePath?: string | null;
  mimeType?: string | null;
}

interface SubmissionDetails {
  id: string;
  formId: string;
  formTitle: string;
  createdAt: string;
  updatedAt: string;
  fields: SubmissionField[];
}

export function LinkedSubmissionDisplay({
  value,
  displayValue,
  onRemove,
  disabled = false,
  formId,
  displayStyle = 'box', // Default to box style
}: LinkedSubmissionDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState<SubmissionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissionDetails = async () => {
    if (submissionDetails) return; // Already loaded
    
    setIsLoading(true);
    setError(null);
    
    try {
      // We need to determine which form this submission belongs to
      // If formId is provided, use it, otherwise try to extract from the URL
      let targetFormId = formId;
      
      if (!targetFormId) {
        // Try to extract from URL
        const url = window.location.pathname;
        const match = url.match(/\/forms\/([^\/]+)/);
        if (match) {
          targetFormId = match[1];
        } else {
          throw new Error('Could not determine form ID');
        }
      }
      
      const response = await fetch(`/api/forms/${targetFormId}/responses/${value}/details`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch submission details: ${response.status}`);
      }
      
      const data = await response.json();
      setSubmissionDetails(data);
    } catch (err) {
      console.error('Error fetching submission details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load submission details');
      toast.error('Could not load linked submission details');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format field value based on type
  const formatFieldValue = (field: SubmissionField) => {
    if (!field.value && field.type !== 'file') return 'N/A';
    
    switch (field.type) {
      case 'file':
        if (!field.fileName && !field.value) return 'No file';
        
        const fileName = field.fileName || field.value;
        const isImage = field.mimeType?.startsWith('image/');
        
        if (field.filePath) {
          const cleanPath = field.filePath.replace(/^api\/files\//, '');
          const fileUrl = `/api/files/${cleanPath}`;
          
          return (
            <a 
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:underline"
            >
              {isImage ? (
                <ImageIcon className="h-4 w-4 mr-1" />
              ) : (
                <FileIcon className="h-4 w-4 mr-1" />
              )}
              <span className="truncate">{fileName}</span>
              <ExternalLink className="h-3 w-3 ml-1 inline-flex" />
            </a>
          );
        }
        
        return (
          <span className="flex items-center">
            {isImage ? (
              <ImageIcon className="h-4 w-4 mr-1" />
            ) : (
              <FileIcon className="h-4 w-4 mr-1" />
            )}
            <span className="truncate">{fileName}</span>
          </span>
        );
        
      case 'checkbox':
        return field.value === 'true' ? 'Yes' : 'No';
        
      case 'linkedSubmission':
        return (
          <span className="text-blue-600">
            {field.value.substring(0, 8)}...
          </span>
        );
        
      default:
        return field.value;
    }
  };

  // Render the trigger content based on display style
  const renderTrigger = () => {
    if (displayStyle === 'simple') {
      return (
        <div className="inline-flex items-center text-blue-600 hover:underline cursor-pointer">
          <span>{value.substring(0, 8)}...</span>
          <ExternalLink className="h-3 w-3 ml-1" />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 p-2 border rounded-md bg-secondary/50 cursor-pointer hover:bg-secondary/70 transition-colors">
        <div className="flex-grow overflow-hidden">
          <p className="text-sm font-medium truncate text-blue-600 hover:underline">
            {displayValue || value}
          </p>
        </div>
        
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Prevent popover from opening
              onRemove();
            }}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        )}
      </div>
    );
  };

  return (
    <Popover onOpenChange={(open) => {
      if (open) fetchSubmissionDetails();
    }}>
      <PopoverTrigger asChild>
        {renderTrigger()}
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 bg-white border shadow-lg" sideOffset={5}>
        <div className="max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Loading submission details...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-red-600">
              <p className="font-medium">Error loading details</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : submissionDetails ? (
            <div>
              <div className="bg-secondary/50 p-3 border-b">
                <h3 className="font-medium">{submissionDetails.formTitle}</h3>
                <p className="text-xs text-muted-foreground">
                  Created: {formatDate(submissionDetails.createdAt)}
                </p>
                {submissionDetails.updatedAt !== submissionDetails.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    Updated: {formatDate(submissionDetails.updatedAt)}
                  </p>
                )}
              </div>
              
              <div className="p-1">
                {submissionDetails.fields.map((field) => (
                  <div key={field.id} className="p-2 border-b last:border-b-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {field.label}
                    </p>
                    <div className="text-sm break-words">
                      {formatFieldValue(field)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-2 border-t bg-secondary/30 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/admin/forms/${submissionDetails.formId}/responses/${submissionDetails.id}/view`, '_blank')}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Full Details
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <p>No details available</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

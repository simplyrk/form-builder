/**
 * Response Table Component
 * Displays form responses in a table format with options to view, edit, and delete responses
 * @module response-table
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Pencil, FileIcon, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import type { Form, Response, Field, ResponseField } from '@/types/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Props for the ResponseTable component
 */
interface ResponseTableProps {
  /** The form containing the responses */
  form: Form;
  /** Array of responses to display */
  responses: Response[];
  /** Map of user IDs to user names */
  userMap: Map<string, string>;
  /** Callback function when responses are deleted */
  onDelete: (responseIds: string[]) => void;
  /** Whether responses are currently being deleted */
  isDeleting?: boolean;
}

/**
 * Gets a shortened version of an ID for display
 * @param {string} id - The full ID to shorten
 * @returns {string} The first 8 characters of the ID in uppercase
 */
function getShortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

/**
 * Renders the value of a response field, handling different field types
 * @param {Field} field - The field definition
 * @param {ResponseField} responseField - The response field value
 * @returns {JSX.Element | string} The rendered field value
 */
function renderFieldValue(field: Field, responseField: ResponseField | undefined) {
  if (!responseField) return 'No response';
  
  // Check if this is a file upload
  if (responseField.filePath) {
    const isImage = responseField.mimeType?.startsWith('image/');
    const fileName = responseField.fileName || 'Download file';
    
    // Ensure the file path starts with a slash
    let filePath = responseField.filePath;
    // If filePath doesn't start with a slash, add it
    if (!filePath.startsWith('/')) {
      filePath = `/${filePath}`;
    }

    return (
      <div className="flex items-center space-x-2">
        {isImage ? (
          <ImageIcon className="h-4 w-4" />
        ) : (
          <FileIcon className="h-4 w-4" />
        )}
        <a
          href={filePath}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {fileName}
        </a>
      </div>
    );
  }

  // Handle different field types
  switch (field.type) {
    case 'checkbox':
      return responseField.value === 'true' ? 'Yes' : 'No';
    case 'multiselect':
      return typeof responseField.value === 'string' 
        ? responseField.value.split(',').join(', ')
        : Array.isArray(responseField.value)
        ? responseField.value.join(', ')
        : responseField.value;
    default:
      return responseField.value;
  }
}

/**
 * ResponseTable Component
 * Displays a table of form responses with options to view, edit, and delete responses
 * @param {ResponseTableProps} props - The component props
 * @returns {JSX.Element} The rendered response table
 */
export function ResponseTable({ form, responses, userMap, onDelete, isDeleting = false }: ResponseTableProps) {
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const toggleResponse = (responseId: string) => {
    const newSelected = new Set(selectedResponses);
    if (newSelected.has(responseId)) {
      newSelected.delete(responseId);
    } else {
      newSelected.add(responseId);
    }
    setSelectedResponses(newSelected);
  };

  const toggleAll = () => {
    if (selectedResponses.size === responses.length) {
      setSelectedResponses(new Set());
    } else {
      setSelectedResponses(new Set(responses.map(r => r.id)));
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(Array.from(selectedResponses));
    setShowDeleteDialog(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectedResponses.size === responses.length}
            onCheckedChange={toggleAll}
            disabled={isDeleting}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Select All
          </label>
        </div>
        {selectedResponses.size > 0 && (
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Selected'}
          </Button>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected responses.
            </AlertDialogDescription>
            <div className="text-sm text-red-500 mt-2">
              Warning: Deleted responses cannot be recovered.
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-12 p-2 text-center">
                <Checkbox
                  id="select-all"
                  checked={selectedResponses.size === responses.length}
                  onCheckedChange={toggleAll}
                  disabled={isDeleting}
                />
              </th>
              <th className="p-2 text-left text-sm font-medium">Submission ID</th>
              <th className="p-2 text-left text-sm font-medium">Submitted By</th>
              <th className="p-2 text-left text-sm font-medium">Date</th>
              {form.fields.map(field => (
                <th key={field.id} className="p-2 text-left text-sm font-medium">
                  {field.label}
                </th>
              ))}
              <th className="p-2 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {responses.map(response => (
              <tr key={response.id} className="border-b">
                <td className="p-2 text-center">
                  <Checkbox
                    checked={selectedResponses.has(response.id)}
                    onCheckedChange={() => toggleResponse(response.id)}
                    disabled={isDeleting}
                  />
                </td>
                <td className="p-2 font-mono text-sm">{getShortId(response.id)}</td>
                <td className="p-2 text-sm">{userMap.get(response.submittedBy) || 'Anonymous User'}</td>
                <td className="p-2 text-sm">
                  {format(new Date(response.createdAt), 'MMM d, yyyy h:mm a')}
                </td>
                {form.fields.map(field => {
                  const fieldResponse = response.fields.find(
                    (f) => f.fieldId === field.id
                  );
                  return (
                    <td key={field.id} className="p-2 text-sm">
                      {renderFieldValue(field, fieldResponse)}
                    </td>
                  );
                })}
                <td className="p-2">
                  <Button variant="ghost" size="sm" asChild disabled={isDeleting}>
                    <Link href={`/admin/forms/${form.id}/responses/${response.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
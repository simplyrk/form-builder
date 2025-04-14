/**
 * User Responses Table Component
 * Displays a user's form responses in a table format with options to view, edit, and delete responses
 * @module user-responses-table
 */

'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, Pencil, FileIcon, ImageIcon } from 'lucide-react';
import type { Form, Response, FormField, ResponseField } from '@/types/form';
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
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from 'next/link';
import { format } from 'date-fns';

/**
 * Props for the UserResponsesTable component
 */
interface UserResponsesTableProps {
  /** Array of responses with their associated forms */
  responses: Array<Response & { form: Form }>;
  /** Callback function when responses are deleted */
  onDelete: (responseIds: string[]) => Promise<{ success: boolean; error?: string }>;
}

const formatId = (id: string) => {
  // Extract a shorter, more readable ID
  // For IDs like "cm9eq140q00068ofvun4fac3n", we'll take the first 8 characters
  return id.slice(0, 8).toUpperCase();
};

/**
 * Renders the value of a response field, handling different field types
 * @param {FormField} field - The field definition
 * @param {ResponseField} responseField - The response field value
 * @returns {JSX.Element | string} The rendered field value
 */
function renderFieldValue(field: FormField, responseField: ResponseField | undefined) {
  if (!responseField) return 'No response';

  // Check if the field is a file type
  if (field.type === 'file') {
    // Determine the path, preferring filePath but falling back to value
    const path = responseField.filePath || responseField.value;

    // If a valid path exists, render it nicely with icon, name, and View link
    if (path && typeof path === 'string') {
      const isImage = responseField.mimeType?.startsWith('image/');
      // Use provided fileName or extract from path
      const fileName = responseField.fileName || path.split('/').pop() || 'File'; 

      return (
        <div className="flex items-center space-x-2">
          {isImage ? (
            <ImageIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
          ) : (
            <FileIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
          )}
          <span className="text-sm truncate" title={fileName}>{fileName}</span>
          <a 
            href={`/api/files/${path}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 text-sm hover:underline ml-auto flex-shrink-0"
          >
            View
          </a>
        </div>
      );
    } else {
      // If it's a file field but no path is found
      return 'No file uploaded';
    }
  }

  // Handle other non-file field types
  switch (field.type) {
    case 'checkbox':
      return responseField.value === 'true' ? 'Yes' : 'No';
    case 'multiselect':
      const multiValue = String(responseField.value);
      return multiValue.split(',').join(', ');
    default:
      return responseField.value;
  }
}

/**
 * UserResponsesTable Component
 * Displays a table of a user's form responses with options to view, edit, and delete responses
 * @param {UserResponsesTableProps} props - The component props
 * @returns {JSX.Element} The rendered user responses table
 */
export function UserResponsesTable({ responses, onDelete }: UserResponsesTableProps) {
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

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

  const handleDelete = async () => {
    if (selectedResponses.size === 0) return;
    
    setIsDeleting(true);
    try {
      const result = await onDelete(Array.from(selectedResponses));
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Responses deleted successfully',
        });
        setSelectedResponses(new Set());
        setShowDeleteDialog(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete responses',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error deleting responses:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selectedResponses.size === responses.length}
            onCheckedChange={toggleAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedResponses.size} selected
          </span>
        </div>
        {selectedResponses.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </>
            )}
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Submission ID</TableHead>
              <TableHead>Submitted</TableHead>
              {responses[0]?.form.fields.map(field => (
                <TableHead key={field.id}>{field.label}</TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response) => (
              <TableRow key={response.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedResponses.has(response.id)}
                    onCheckedChange={() => toggleResponse(response.id)}
                  />
                </TableCell>
                <TableCell>{response.form.title}</TableCell>
                <TableCell>{formatId(response.id)}</TableCell>
                <TableCell>
                  {new Date(response.createdAt).toLocaleString()}
                </TableCell>
                {response.form.fields.map(field => {
                  const fieldResponse = response.fields.find(
                    (f) => f.fieldId === field.id
                  );
                  return (
                    <TableCell key={field.id}>
                      {renderFieldValue(field, fieldResponse)}
                    </TableCell>
                  );
                })}
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/forms/${response.form.id}/responses/${response.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedResponses(new Set([response.id]));
                        setShowDeleteDialog(true);
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 
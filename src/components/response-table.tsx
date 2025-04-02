'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import type { Form, Response } from '@/types/form';
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

interface ResponseTableProps {
  form: Form;
  responses: Response[];
  userMap: Map<string, string>;
  onDelete: (responseIds: string[]) => void;
  isDeleting?: boolean;
}

function getShortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

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
              <div className="mt-2 text-sm text-red-500">
                Warning: Deleted responses cannot be recovered.
              </div>
            </AlertDialogDescription>
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
                {form.fields.map(field => (
                  <td key={field.id} className="p-2 text-sm">
                    {response.fields.find(f => f.fieldId === field.id)?.value || 'No response'}
                  </td>
                ))}
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
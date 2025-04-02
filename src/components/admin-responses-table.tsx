'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';

interface AdminResponsesTableProps {
  responses: Array<Response & { form: Form }>;
  onDelete: (responseIds: string[]) => Promise<{ success: boolean; error?: string }>;
}

function getShortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function AdminResponsesTable({ responses, onDelete }: AdminResponsesTableProps) {
  const { toast } = useToast();
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await onDelete(Array.from(selectedResponses));
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Selected responses deleted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete responses',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setSelectedResponses(new Set());
    }
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
              <th className="p-2 text-left text-sm font-medium">Survey Name</th>
              <th className="p-2 text-left text-sm font-medium">Submission ID</th>
              <th className="p-2 text-left text-sm font-medium">Submission Date</th>
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
                <td className="p-2 text-sm">{response.form.title}</td>
                <td className="p-2 font-mono text-sm">{getShortId(response.id)}</td>
                <td className="p-2 text-sm">
                  {format(new Date(response.createdAt), 'MMM d, yyyy h:mm a')}
                </td>
                <td className="p-2">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild disabled={isDeleting}>
                      <Link href={`/forms/${response.form.id}/responses/${response.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setSelectedResponses(new Set([response.id]));
                        setShowDeleteDialog(true);
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
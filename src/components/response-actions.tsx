'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Trash2 } from 'lucide-react';

import { deleteResponses } from '@/app/actions/forms';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface ResponseActionsProps {
  selectedResponses: string[];
  formId: string;
}

export function ResponseActions({ selectedResponses, formId }: ResponseActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteResponses(formId, selectedResponses);
      toast({
        title: 'Success',
        description: `${selectedResponses.length} response(s) deleted successfully.`,
      });
      router.refresh();
    } catch (err) {
      console.error('Error deleting responses:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete responses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (selectedResponses.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {selectedResponses.length} selected
      </span>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Responses</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedResponses.length} response(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Form, Response } from '@/types/form';

interface FormResponsesTableProps {
  form: Form;
  responses: Response[];
  onDelete: (responseIds: string[]) => void;
}

function getShortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function FormResponsesTable({ form, responses, onDelete }: FormResponsesTableProps) {
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());

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
    onDelete(Array.from(selectedResponses));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectedResponses.size === responses.length}
            onCheckedChange={toggleAll}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Select All
          </label>
        </div>
        {selectedResponses.size > 0 && (
          <Button variant="destructive" onClick={handleDelete}>
            Delete Selected
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-12 p-2 text-center">
                <Checkbox
                  id="select-all"
                  checked={selectedResponses.size === responses.length}
                  onCheckedChange={toggleAll}
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
                  />
                </td>
                <td className="p-2 text-sm">{form.title}</td>
                <td className="p-2 font-mono text-sm">{getShortId(response.id)}</td>
                <td className="p-2 text-sm">
                  {format(new Date(response.createdAt), 'MMM d, yyyy h:mm a')}
                </td>
                <td className="p-2">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/forms/${form.id}/responses/${response.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete([response.id])}
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
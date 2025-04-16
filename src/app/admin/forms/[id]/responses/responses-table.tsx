'use client';

import { format } from 'date-fns';
import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Form, Response } from '@/types/form';

interface ResponsesTableProps {
  form: Form;
  responses: Response[];
}

function downloadCSV(form: Form, responses: Response[]) {
  // Create CSV header
  const headers = ['Submission Date', 'Submitted By', ...form.fields.map(f => f.label)];
  const csvRows = [headers];

  // Add data rows
  responses.forEach(response => {
    const row = [
      format(new Date(response.createdAt), 'PPpp'),
      response.submittedBy,
      ...form.fields.map(field => {
        const fieldResponse = response.fields.find(f => f.fieldId === field.id);
        return fieldResponse?.value ?? '';
      })
    ] as string[];
    csvRows.push(row);
  });

  // Convert to CSV string
  const csvContent = csvRows
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${form.title.toLowerCase().replace(/\s+/g, '-')}-responses.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ResponsesTable({ form, responses }: ResponsesTableProps) {
  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <div className="text-sm text-muted-foreground mr-4">
          {responses.length} {responses.length === 1 ? 'response' : 'responses'}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadCSV(form, responses)}
        >
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No responses yet.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submission Date</TableHead>
                <TableHead>Submitted By</TableHead>
                {form.fields.map((field) => (
                  <TableHead key={field.id}>{field.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(response.createdAt), 'PPpp')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {response.submittedBy}
                  </TableCell>
                  {form.fields.map((field) => {
                    const fieldResponse = response.fields.find(
                      (f) => f.fieldId === field.id
                    );
                    return (
                      <TableCell key={field.id} className="text-sm">
                        {fieldResponse?.value || 'No response'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
} 
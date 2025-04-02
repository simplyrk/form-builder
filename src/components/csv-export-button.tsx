'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Form, Response } from '@/types/form';
import { format } from 'date-fns';

interface CSVExportButtonProps {
  form: Form;
  responses: Response[];
  userMap: Map<string, string>;
}

export function CSVExportButton({ form, responses, userMap }: CSVExportButtonProps) {
  const generateCSV = () => {
    // Create CSV header
    const headers = ['Submission ID', 'Submitted By', 'Date', ...form.fields.map(field => field.label)];
    const csvRows = [headers];

    // Add data rows
    responses.forEach(response => {
      const row = [
        response.id.slice(0, 8).toUpperCase(),
        userMap.get(response.submittedBy) || 'Anonymous User',
        format(new Date(response.createdAt), 'MMM d, yyyy h:mm a'),
        ...form.fields.map(field => {
          const fieldResponse = response.fields.find(f => f.fieldId === field.id);
          return fieldResponse?.value || 'No response';
        })
      ];
      csvRows.push(row);
    });

    // Convert to CSV string
    return csvRows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  };

  const handleExport = () => {
    const csvContent = generateCSV();
    const fileName = `${form.title.toLowerCase().replace(/\s+/g, '-')}-responses.csv`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
} 
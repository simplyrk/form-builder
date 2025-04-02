'use client';

import Link from 'next/link';
import { Form } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Pencil, Eye, BarChart2, Trash2 } from 'lucide-react';
import { toggleFormPublish, deleteForm } from '@/app/actions/forms';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AdminPageClientProps {
  forms: Form[];
}

export default function AdminPageClient({ forms: initialForms }: AdminPageClientProps) {
  const [forms, setForms] = useState(initialForms);
  const [loading, setLoading] = useState<string | null>(null);

  const handlePublish = async (formId: string) => {
    setLoading(formId);
    try {
      const updatedForm = await toggleFormPublish(formId);
      setForms(forms.map(form => 
        form.id === formId ? updatedForm : form
      ));
    } catch (error) {
      console.error('Failed to toggle form publish status:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;
    
    setLoading(formId);
    try {
      await deleteForm(formId);
      setForms(forms.filter(form => form.id !== formId));
    } catch (error) {
      console.error('Failed to delete form:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Manage Forms</h1>
        <Link href="/admin/forms/new">
          <Button>Create New Form</Button>
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No forms created yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {forms.map((form) => (
            <div
              key={form.id}
              className="rounded-lg border bg-card p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {form.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {form.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublish(form.id)}
                    disabled={loading === form.id}
                  >
                    {form.published ? 'Draft' : 'Publish'}
                  </Button>
                  <Link href={`/forms/${form.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/admin/forms/${form.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/admin/forms/${form.id}/responses`}>
                    <Button variant="outline" size="sm">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Responses
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(form.id)}
                    disabled={loading === form.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
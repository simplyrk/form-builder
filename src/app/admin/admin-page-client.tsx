'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Pencil, Eye, BarChart2, Trash2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

import { toggleFormPublish, deleteForm } from '@/app/actions/forms';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Form } from '@/types/form';
import { TEXT } from '@/lib/text-constants';

interface AdminPageClientProps {
  forms: Form[];
}

export default function AdminPageClient({ forms: initialForms }: AdminPageClientProps) {
  const [forms, setForms] = useState(initialForms);
  const [loading, setLoading] = useState<string | null>(null);
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);

  const handlePublish = async (formId: string) => {
    setLoading(formId);
    try {
      const updatedForm = await toggleFormPublish(formId);
      setForms(forms.map(form => 
        form.id === formId ? { ...form, published: updatedForm.published } : form
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

  const handleCopyUrl = (formId: string) => {
    const url = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        // Set the copied form ID to show visual feedback
        setCopiedFormId(formId);
        
        // Show a more visible toast
        toast.success('Survey URL copied to clipboard', {
          duration: 2000,
          position: 'top-center',
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: 'bold',
          },
        });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopiedFormId(null);
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy URL:', err);
        toast.error('Failed to copy URL', {
          duration: 3000,
          position: 'top-center',
        });
      });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">{TEXT.MANAGE_FORMS}</h1>
        <Link href="/admin/forms/new">
          <Button>{TEXT.CREATE_NEW_FORM}</Button>
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
                  <Button
                    variant={copiedFormId === form.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCopyUrl(form.id)}
                    disabled={!form.published}
                    title={form.published ? "Copy survey URL" : "Publish form to get URL"}
                    className={cn(
                      "transition-all duration-200",
                      copiedFormId === form.id && "bg-green-500 hover:bg-green-600"
                    )}
                  >
                    {copiedFormId === form.id ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copiedFormId === form.id ? "Copied!" : "Copy URL"}
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
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(form.id)}
                    disabled={loading === form.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Created: {new Date(form.createdAt).toISOString().split('T')[0]}</span>
                <span>•</span>
                <span>Fields: {form.fields.length}</span>
                <span>•</span>
                <span className={cn(
                  "font-medium",
                  form.published ? "text-green-500" : "text-amber-500"
                )}>
                  {form.published ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
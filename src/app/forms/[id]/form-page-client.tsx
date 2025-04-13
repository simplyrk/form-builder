'use client';

import { FormViewer } from '@/components/form-viewer';
import { Form } from '@/types/form';
import { submitForm } from '@/app/actions/responses';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { FormsLayout } from '@/components/forms-layout';

interface FormPageClientProps {
  form: Form;
  userId: string | null;
}

type FormDataValue = string | number | boolean | string[] | File | null;

export default function FormPageClient({ form, userId }: FormPageClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { userId: clerkUserId } = useAuth();

  const handleSubmit = async (data: Record<string, FormDataValue>) => {
    try {
      // Convert FormDataValue to the expected format for the API
      const apiData: Record<string, string | number | boolean | null> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value instanceof File) {
          // Handle file uploads separately
          apiData[key] = null; // We'll handle file uploads in a separate step
        } else if (Array.isArray(value)) {
          apiData[key] = value.join(',');
        } else {
          apiData[key] = value as string | number | boolean | null;
        }
      }
      
      await submitForm(form.id, userId || clerkUserId || null, apiData);
      toast({
        title: 'Form submitted successfully',
        description: 'Thank you for your submission!',
      });
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Submission Error',
        description: 'Failed to submit the form. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <FormsLayout>
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-4">{form.title}</h1>
          {form.description && (
            <p className="text-muted-foreground mb-8">{form.description}</p>
          )}
          <FormViewer
            form={form}
            initialData={{}}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </FormsLayout>
  );
} 
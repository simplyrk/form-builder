'use client';

import { FormViewer } from '@/components/form-viewer';
import { Form } from '@/types/form';
import { submitForm } from '@/app/actions/responses';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface FormPageClientProps {
  form: Form;
  userId: string | null;
}

export default function FormPageClient({ form, userId }: FormPageClientProps) {
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await submitForm(form.id, userId, data);
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
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-4">{form.title}</h1>
        {form.description && (
          <p className="text-muted-foreground mb-8">{form.description}</p>
        )}
        <FormViewer
          form={form}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
} 
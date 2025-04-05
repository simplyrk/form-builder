import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { submitResponse } from '@/app/actions/forms';
import { FileIcon, ImageIcon, X } from 'lucide-react';
import type { Form, Field } from '@/types/form';

interface FormProps {
  form: Form;
}

export function Form({ form }: FormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitResponse(form.id, formData);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Your response has been submitted successfully.',
        });
        router.push('/');
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to submit response',
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
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleFileChange = (fieldId: string, file: File | null) => {
    if (file) {
      handleFieldChange(fieldId, file);
      
      // Create a preview URL for images
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setFilePreviews(prev => ({
          ...prev,
          [fieldId]: previewUrl,
        }));
      }
    } else {
      // Clear the file and preview
      handleFieldChange(fieldId, null);
      if (filePreviews[fieldId]) {
        URL.revokeObjectURL(filePreviews[fieldId]);
        setFilePreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[fieldId];
          return newPreviews;
        });
      }
    }
  };

  const renderField = (field: Field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <Input
            type={field.type}
            id={field.id}
            required={field.required}
            onChange={e => handleFieldChange(field.id, e.target.value)}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            required={field.required}
            onChange={e => handleFieldChange(field.id, e.target.value)}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            id={field.id}
            onCheckedChange={checked => handleFieldChange(field.id, checked)}
          />
        );
      case 'radio':
        return (
          <RadioGroup onValueChange={(value: string) => handleFieldChange(field.id, value)}>
            {field.options.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'select':
        return (
          <Select onValueChange={value => handleFieldChange(field.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'file':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              id={field.id}
              required={field.required}
              onChange={e => {
                const file = e.target.files?.[0] || null;
                handleFileChange(field.id, file);
              }}
            />
            {filePreviews[field.id] && (
              <div className="relative mt-2">
                {formData[field.id]?.type?.startsWith('image/') ? (
                  <div className="relative">
                    <img 
                      src={filePreviews[field.id]} 
                      alt="Preview" 
                      className="max-h-40 rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80"
                      onClick={() => handleFileChange(field.id, null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 p-2 border rounded-md">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm truncate">{formData[field.id]?.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                      onClick={() => handleFileChange(field.id, null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {form.fields.map(field => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderField(field)}
          </div>
        ))}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
} 
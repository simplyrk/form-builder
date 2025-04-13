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
import { X } from 'lucide-react';
import type { Form, Field } from '@/types/form';
import Image from 'next/image';

type FieldValue = {
  text: string;
  textarea: string;
  number: number;
  email: string;
  tel: string;
  url: string;
  select: string;
  multiselect: string[];
  checkbox: boolean;
  radio: string;
  file: File | null;
  date: string;
  time: string;
  datetime: string;
};

interface FormProps {
  form: Form;
}

export function Form({ form }: FormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, FieldValue[keyof FieldValue]>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert form data to the expected format
      const processedData: Record<string, string | number | boolean | null> = {};
      for (const [key, value] of Object.entries(formData)) {
        if (value instanceof File) {
          // Handle file uploads separately
          const formDataObj = new FormData();
          formDataObj.append('file', value);
          // TODO: Implement file upload handling
          processedData[key] = null;
        } else if (Array.isArray(value)) {
          processedData[key] = value.join(',');
        } else if (typeof value === 'boolean') {
          processedData[key] = value;
        } else if (typeof value === 'number') {
          processedData[key] = value;
        } else {
          processedData[key] = value?.toString() || null;
        }
      }

      const result = await submitResponse(form.id, processedData);
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
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: FieldValue[keyof FieldValue]) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleFileChange = (fieldId: string, file: File | null) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fieldId]: file,
      }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFilePreviews(prev => ({
        ...prev,
        [fieldId]: previewUrl,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [fieldId]: null,
      }));
      setFilePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[fieldId];
        return newPreviews;
      });
    }
  };

  const renderField = (field: Field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'number':
      case 'date':
      case 'time':
      case 'datetime':
        return (
          <Input
            type={field.type}
            id={field.id}
            required={field.required}
            onChange={e => handleFieldChange(field.id, e.target.value as FieldValue[keyof FieldValue])}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            required={field.required}
            onChange={e => handleFieldChange(field.id, e.target.value as FieldValue[keyof FieldValue])}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            id={field.id}
            onCheckedChange={checked => handleFieldChange(field.id, checked as FieldValue[keyof FieldValue])}
          />
        );
      case 'radio':
        return (
          <RadioGroup onValueChange={(value: string) => handleFieldChange(field.id, value as FieldValue[keyof FieldValue])}>
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
          <Select onValueChange={value => handleFieldChange(field.id, value as FieldValue[keyof FieldValue])}>
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
              onChange={e => {
                const file = e.target.files?.[0] || null;
                handleFileChange(field.id, file);
              }}
              required={field.required}
            />
            {filePreviews[field.id] && (
              <div className="relative">
                <Image
                  src={filePreviews[field.id]}
                  alt="Preview"
                  width={320}
                  height={240}
                  className="max-w-xs rounded-lg object-contain"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleFileChange(field.id, null)}
                >
                  <X className="h-4 w-4" />
                </Button>
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
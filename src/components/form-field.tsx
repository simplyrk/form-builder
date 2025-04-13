'use client';

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field } from '@/types/form';

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

type FieldType = keyof FieldValue;

interface FormFieldProps {
  field: Field;
  value: FieldValue[FieldType];
  onChange: (value: FieldValue[FieldType]) => void;
  disabled?: boolean;
}

export function FormField({ field, value, onChange, disabled = false }: FormFieldProps) {
  console.log('Rendering field:', field);

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value as FieldValue['text'])}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value as FieldValue['textarea'])}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'select':
        return (
          <Select
            value={value as string || ''}
            onValueChange={(value) => onChange(value as FieldValue['select'])}
            required={field.required}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'email':
        return (
          <Input
            type="email"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value as FieldValue['email'])}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value as number || ''}
            onChange={(e) => onChange(Number(e.target.value) as FieldValue['number'])}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value as FieldValue['date'])}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'file':
        return (
          <Input
            id={field.id}
            type="file"
            onChange={(e) => onChange(e.target.files?.[0] as FieldValue['file'])}
            required={field.required}
            disabled={disabled}
          />
        );
      default:
        return (
          <Input
            type={field.type}
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value as FieldValue[FieldType])}
            required={field.required}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
    </div>
  );
} 
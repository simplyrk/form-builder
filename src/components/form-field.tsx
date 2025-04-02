'use client';

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field } from '@/types/form';

interface FormFieldProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
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
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={onChange}
            required={field.required}
            disabled={disabled}
          >
            <SelectTrigger id={field.id}>
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
            id={field.id}
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            disabled={disabled}
          />
        );
      case 'file':
        return (
          <Input
            id={field.id}
            type="file"
            onChange={(e) => onChange(e.target.files?.[0])}
            required={field.required}
            disabled={disabled}
          />
        );
      default:
        return (
          <Input
            id={field.id}
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
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
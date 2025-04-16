'use client';

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Field } from '@/types/form';

/**
 * Type representing the possible values for each field type.
 * Each key corresponds to a specific form field type, and the value
 * represents the data type that field would collect.
 */
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

/**
 * Type alias to get the keys of the FieldValue type.
 * Used to ensure type safety when accessing field values.
 */
type FieldType = keyof FieldValue;

/**
 * Props for the FormField component.
 * 
 * @property field - The field configuration object containing type, id, label, etc.
 * @property value - The current value of the field, typed according to the field type
 * @property onChange - Callback function to handle value changes
 * @property disabled - Optional flag to disable the field input
 */
interface FormFieldProps {
  field: Field;
  value: FieldValue[FieldType];
  onChange: (value: FieldValue[FieldType]) => void;
  disabled?: boolean;
}

/**
 * FormField component that renders different input fields based on the field type.
 * Supports various input types including text, textarea, select, email, number, etc.
 * 
 * @param props - The component props (see FormFieldProps interface)
 * @returns A form field component with appropriate input type and validation
 */
export function FormField({ field, value, onChange, disabled = false }: FormFieldProps) {
  /**
   * Renders the appropriate input element based on the field type.
   * 
   * @returns The rendered input element
   */
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
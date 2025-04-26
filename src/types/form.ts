/**
 * Form Builder Types
 * This module contains TypeScript interfaces for form data structures
 * @module form-types
 */

/**
 * Input type for creating or updating a form
 */
export interface FormInput {
  /** The title of the form */
  title: string;
  /** Optional description of the form */
  description?: string;
  /** Optional form group for categorizing forms */
  formGroup?: string;
  /** Whether the form is published and accessible */
  published?: boolean;
  /** Array of form fields */
  fields: FieldInput[];
}

/**
 * Input type for creating or updating a form field
 */
export interface FieldInput {
  /** The label text for the field */
  label: string;
  /** The type of field (text, textarea, date, etc.) */
  type: string;
  /** Whether the field is required */
  required: boolean;
  /** Array of options for select/radio/checkbox fields */
  options?: string[];
  /** The order of the field in the form */
  order: number;
  /** Optional help text to display under the field */
  helpText?: string;
}

export type FieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'tel'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'picklist';

export interface FormField {
  id: string;
  formId: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
  /** Optional help text to display under the field */
  helpText?: string;
}

/**
 * Field type alias for backward compatibility
 * This is used in components that import the Field type
 */
export type Field = FormField;

/**
 * Database model for a form
 */
export interface Form {
  /** Unique identifier for the form */
  id: string;
  /** The title of the form */
  title: string;
  /** Optional description of the form */
  description: string;
  /** Optional form group for categorizing forms */
  formGroup?: string;
  /** Whether the form is published and accessible */
  published: boolean;
  /** When the form was created */
  createdAt: Date;
  /** When the form was last updated */
  updatedAt: Date;
  /** ID of the user who created the form */
  createdBy: string;
  /** Array of fields in the form */
  fields: FormField[];
  /** Array of responses to the form */
  responses: FormResponse[];
}

/**
 * Database model for a form response
 */
export interface FormResponse {
  /** Unique identifier for the response */
  id: string;
  /** ID of the form this response is for */
  formId: string;
  /** When the response was submitted */
  createdAt: Date;
  /** When the response was last updated */
  updatedAt: Date;
  /** Array of field values in the response */
  fields: ResponseField[];
}

/**
 * Database model for a response field value
 */
export interface ResponseField {
  /** Unique identifier for the response field */
  id: string;
  /** ID of the response this value belongs to */
  responseId: string;
  /** ID of the field this value is for */
  fieldId: string;
  /** The value submitted for this field */
  value: string;
  /** The name of the file uploaded for this field */
  fileName?: string | null;
  /** The path to the file uploaded for this field */
  filePath?: string | null;
  /** The size of the file uploaded for this field */
  fileSize?: number | null;
  /** The MIME type of the file uploaded for this field */
  mimeType?: string | null;
  /** When the response field was created */
  createdAt: Date;
  /** When the response field was last updated */
  updatedAt: Date;
}

export interface FormWithResponses extends Form {
  responses: FormResponse[];
}

export interface FormFieldWithResponses extends FormField {
  responses: ResponseField[];
}

/**
 * Response interface for backward compatibility
 * This interface extends FormResponse but doesn't add any new members.
 * It's kept for backward compatibility with existing code.
 */
export interface Response extends FormResponse {
  /** ID of the user who submitted the response */
  submittedBy: string;
} 
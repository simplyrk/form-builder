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
  options: string[];
  /** The order of the field in the form */
  order: number;
}

/**
 * Database model for a form
 */
export interface Form {
  /** Unique identifier for the form */
  id: string;
  /** The title of the form */
  title: string;
  /** Optional description of the form */
  description?: string;
  /** Whether the form is published and accessible */
  published: boolean;
  /** When the form was created */
  createdAt: Date;
  /** When the form was last updated */
  updatedAt: Date;
  /** ID of the user who created the form */
  createdBy: string;
  /** Array of fields in the form */
  fields: Field[];
  /** Array of responses to the form */
  responses: Response[];
}

/**
 * Database model for a form field
 */
export interface Field {
  /** Unique identifier for the field */
  id: string;
  /** The label text for the field */
  label: string;
  /** The type of field (text, textarea, date, etc.) */
  type: string;
  /** Whether the field is required */
  required: boolean;
  /** Array of options for select/radio/checkbox fields */
  options: string[];
  /** The order of the field in the form */
  order: number;
  /** ID of the form this field belongs to */
  formId: string;
  /** Reference to the parent form */
  form: Form;
  /** Array of response values for this field */
  responses: ResponseField[];
}

/**
 * Database model for a form response
 */
export interface Response {
  /** Unique identifier for the response */
  id: string;
  /** ID of the form this response is for */
  formId: string;
  /** Reference to the parent form */
  form: Form;
  /** ID of the user who submitted the response */
  submittedBy: string;
  /** When the response was submitted */
  createdAt: Date;
  /** Array of field values in the response */
  fields: ResponseField[];
}

/**
 * Database model for a response field value
 */
export interface ResponseField {
  /** Unique identifier for the response field */
  id: string;
  /** ID of the field this value is for */
  fieldId: string;
  /** ID of the response this value belongs to */
  responseId: string;
  /** The value submitted for this field */
  value: string | boolean | string[];
  /** Original filename for file uploads */
  fileName?: string;
  /** Path to the stored file for file uploads */
  filePath?: string;
  /** Size of the file in bytes for file uploads */
  fileSize?: number;
  /** MIME type of the file for file uploads */
  mimeType?: string;
  /** When the response field was created */
  createdAt: Date;
  /** When the response field was last updated */
  updatedAt: Date;
} 
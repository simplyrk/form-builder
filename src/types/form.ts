// Base types for form creation/update
export interface FormInput {
  title: string;
  description?: string;
  fields: FieldInput[];
}

export interface FieldInput {
  label: string;
  type: string;
  required: boolean;
  options: string[];
  order: number;
}

// Database types (after creation)
export interface Form {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  fields: Field[];
  responses: Response[];
}

export interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
  order: number;
  formId: string;
  form: Form;
  responses: ResponseField[];
}

export interface Response {
  id: string;
  formId: string;
  form: Form;
  submittedBy: string;
  createdAt: Date;
  fields: ResponseField[];
}

export interface ResponseField {
  id: string;
  responseId: string;
  response: Response;
  fieldId: string;
  field: Field;
  value: string;
} 
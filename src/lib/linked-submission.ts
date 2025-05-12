/**
 * Utilities for handling linked submission fields in forms
 */

interface Submission {
  id: string;
  formId: string;
  data: Record<string, any>;
}

interface LinkedSubmissionValue {
  submissionId: string;
  formId: string;
  displayValue: string;
  displayFields: string[];
  submissionData: Record<string, any>;
}

/**
 * Transforms a linked submission field value to include submission data
 * 
 * @param value - The linked submission ID value
 * @param submission - The complete submission data
 * @param displayFields - Fields to use for display value
 * @returns Formatted linked submission object or null if no value
 */
export function transformLinkedSubmissionField(
  value: string | null | undefined,
  submission?: Submission,
  displayFields: string[] = []
): LinkedSubmissionValue | null {
  // Return null for empty values
  if (!value) return null;
  
  // If no submission data provided, just return the ID
  if (!submission) {
    return {
      submissionId: value,
      formId: '',
      displayValue: value,
      displayFields: [],
      submissionData: {}
    };
  }
  
  // Create display value from specified fields
  let displayValue = value; // Default to submission ID
  
  if (displayFields.length > 0) {
    const fieldValues = displayFields
      .map(field => submission.data[field])
      .filter(Boolean);
      
    if (fieldValues.length > 0) {
      displayValue = fieldValues.join(', ');
    }
  }
  
  return {
    submissionId: submission.id,
    formId: submission.formId,
    displayValue,
    displayFields,
    submissionData: submission.data
  };
} 
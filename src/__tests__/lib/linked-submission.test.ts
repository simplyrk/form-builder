import { transformLinkedSubmissionField } from '@/lib/linked-submission';

describe('transformLinkedSubmissionField', () => {
  it('should return null for empty linked submission value', () => {
    expect(transformLinkedSubmissionField(null)).toBeNull();
    expect(transformLinkedSubmissionField(undefined)).toBeNull();
    expect(transformLinkedSubmissionField('')).toBeNull();
  });

  it('should transform linked submission value to include submission data', () => {
    const linkedValue = 'submission-123';
    const submission = {
      id: 'submission-123',
      formId: 'form-abc',
      data: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    };

    const displayFields = ['name', 'email'];
    
    const result = transformLinkedSubmissionField(linkedValue, submission, displayFields);
    
    expect(result).toEqual({
      submissionId: 'submission-123',
      formId: 'form-abc',
      displayValue: 'John Doe, john@example.com',
      displayFields: ['name', 'email'],
      submissionData: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    });
  });

  it('should handle missing display fields', () => {
    const linkedValue = 'submission-123';
    const submission = {
      id: 'submission-123',
      formId: 'form-abc',
      data: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    };
    
    const result = transformLinkedSubmissionField(linkedValue, submission);
    
    expect(result).toEqual({
      submissionId: 'submission-123',
      formId: 'form-abc',
      displayValue: 'submission-123',
      displayFields: [],
      submissionData: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    });
  });
}); 
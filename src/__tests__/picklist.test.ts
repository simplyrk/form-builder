import { auth } from '@clerk/nextjs/server';

import { createForm, updateForm, updateResponse } from '@/app/actions/forms';
import { prisma } from '@/lib/prisma';
import { Form, FormField, FieldType, FormInput, Response } from '@/types/form';

// Mock the Prisma client
jest.mock('@/lib/prisma', () => {
  const mockPrisma = {
    form: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    field: {
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    response: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    responseField: {
      create: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  
  // Add $transaction implementation
  mockPrisma.$transaction = jest.fn((callback) => callback(mockPrisma));
  
  return {
    prisma: mockPrisma,
  };
});

// Mock auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn().mockResolvedValue({ userId: 'test-user-id' }),
}));

// Mock revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Picklist Field Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock data
  const mockUserId = 'test-user-id';
  const mockFormId = 'form-id-123';
  const mockResponseId = 'response-id-456';
  const mockPicklistFieldId = 'picklist-field-id-789';

  const mockFormWithPicklistField: Form = {
    id: mockFormId,
    title: 'Test Form',
    description: 'Form with a picklist field',
    formGroup: 'Test',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: mockUserId,
    fields: [
      {
        id: mockPicklistFieldId,
        formId: mockFormId,
        label: 'Select an option',
        type: 'picklist' as FieldType,
        required: true,
        options: ['Option 1', 'Option 2', 'Option 3'],
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    responses: [],
  };

  describe('Form Creation with Picklist', () => {
    it('should create a form with a picklist field', async () => {
      // Setup mocks
      (prisma.form.create as jest.Mock).mockResolvedValueOnce({
        ...mockFormWithPicklistField,
        fields: mockFormWithPicklistField.fields,
      });

      // Create form input
      const formInput = {
        title: 'Test Form',
        description: 'Form with a picklist field',
        formGroup: 'Test',
        fields: [
          {
            label: 'Select an option',
            type: 'picklist',
            required: true,
            options: ['Option 1', 'Option 2', 'Option 3'],
            order: 0,
          }
        ],
      };

      // Call createForm
      const result = await createForm(formInput);

      // Assertions
      expect(result.success).toBe(true);
      expect(prisma.form.create).toHaveBeenCalledTimes(1);
      expect(prisma.form.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fields: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({
                  type: 'picklist',
                  options: ['Option 1', 'Option 2', 'Option 3'],
                }),
              ]),
            }),
          }),
        })
      );
    });
  });

  describe('Form Updating with Picklist', () => {
    it('should update a picklist field options', async () => {
      // Setup mocks
      (prisma.form.findUnique as jest.Mock).mockResolvedValueOnce(mockFormWithPicklistField);
      (prisma.form.update as jest.Mock).mockResolvedValueOnce(mockFormWithPicklistField);
      (prisma.field.update as jest.Mock).mockResolvedValueOnce(mockFormWithPicklistField.fields[0]);
      (prisma.form.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFormWithPicklistField,
        fields: [
          {
            ...mockFormWithPicklistField.fields[0],
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          },
        ],
      });

      // Update form input
      const updateInput = {
        title: 'Test Form',
        description: 'Form with updated picklist field',
        formGroup: 'Test',
        published: true,
        fields: [
          {
            label: 'Select an option',
            type: 'picklist',
            required: true,
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            order: 0,
          }
        ],
      };

      // Call updateForm
      const result = await updateForm(mockFormId, updateInput);

      // Assertions
      expect(result.success).toBe(true);
      expect(prisma.field.update).toHaveBeenCalledTimes(1);
      expect(prisma.field.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          }),
        })
      );
    });
  });

  describe('Response with Picklist Field', () => {
    // Mock data for response tests
    const mockEmptyResponse: Response = {
      id: mockResponseId,
      formId: mockFormId,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [],
      submittedBy: mockUserId,
    };

    const mockResponseWithPicklist: Response = {
      id: mockResponseId,
      formId: mockFormId,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: 'response-field-id-123',
          responseId: mockResponseId,
          fieldId: mockPicklistFieldId,
          value: 'Option 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      submittedBy: mockUserId,
    };

    it('should create response field when updating from empty value to picklist value', async () => {
      // Setup mocks
      (prisma.response.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockEmptyResponse,
        form: mockFormWithPicklistField,
      });
      (prisma.responseField.updateMany as jest.Mock).mockResolvedValueOnce({ count: 0 });
      (prisma.responseField.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-response-field-id',
        responseId: mockResponseId,
        fieldId: mockPicklistFieldId,
        value: 'Option 2',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create form data for update
      const formData = new FormData();
      formData.append(mockPicklistFieldId, 'Option 2');

      // Call updateResponse
      const result = await updateResponse(mockFormId, mockResponseId, formData);

      // Assertions
      expect(result.success).toBe(true);
      expect(prisma.responseField.create).toHaveBeenCalledTimes(1);
      expect(prisma.responseField.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            responseId: mockResponseId,
            fieldId: mockPicklistFieldId,
            value: 'Option 2',
          }),
        })
      );
    });

    it('should update existing response field when changing from one picklist value to another', async () => {
      // Setup mocks
      (prisma.response.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockResponseWithPicklist,
        form: mockFormWithPicklistField,
      });
      (prisma.responseField.updateMany as jest.Mock).mockResolvedValueOnce({ count: 1 });

      // Create form data for update
      const formData = new FormData();
      formData.append(mockPicklistFieldId, 'Option 3');

      // Call updateResponse
      const result = await updateResponse(mockFormId, mockResponseId, formData);

      // Assertions
      expect(result.success).toBe(true);
      expect(prisma.responseField.updateMany).toHaveBeenCalledTimes(1);
      expect(prisma.responseField.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            responseId: mockResponseId,
            fieldId: mockPicklistFieldId,
          }),
          data: expect.objectContaining({
            value: 'Option 3',
          }),
        })
      );
    });
  });

  describe('Edge Cases for Picklist Fields', () => {
    it('should handle empty picklist options', async () => {
      // Setup mocks
      (prisma.form.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFormWithPicklistField,
        fields: [
          {
            ...mockFormWithPicklistField.fields[0],
            options: [],
          },
        ],
      });
      (prisma.form.update as jest.Mock).mockResolvedValueOnce(mockFormWithPicklistField);
      (prisma.field.update as jest.Mock).mockResolvedValueOnce({
        ...mockFormWithPicklistField.fields[0],
        options: ['New Option'],
      });
      (prisma.form.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFormWithPicklistField,
        fields: [
          {
            ...mockFormWithPicklistField.fields[0],
            options: ['New Option'],
          },
        ],
      });

      // Update form input with empty options initially
      const updateInput = {
        title: 'Test Form',
        description: 'Form with updated picklist field',
        formGroup: 'Test',
        published: true,
        fields: [
          {
            label: 'Select an option',
            type: 'picklist',
            required: true,
            options: ['New Option'],
            order: 0,
          }
        ],
      };

      // Call updateForm
      const result = await updateForm(mockFormId, updateInput);

      // Assertions
      expect(result.success).toBe(true);
      expect(prisma.field.update).toHaveBeenCalledTimes(1);
      expect(prisma.field.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            options: ['New Option'],
          }),
        })
      );
    });

    it('should handle clearing a picklist value', async () => {
      // Setup mocks
      (prisma.response.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockResponseWithPicklistField,
        form: mockFormWithPicklistField,
      });
      (prisma.responseField.updateMany as jest.Mock).mockResolvedValueOnce({ count: 1 });

      // Create form data for update to clear the value
      const formData = new FormData();
      formData.append(mockPicklistFieldId, ''); // Empty value

      // Call updateResponse
      const result = await updateResponse(mockFormId, mockResponseId, formData);

      // Assertions
      expect(result.success).toBe(true);
      expect(prisma.responseField.updateMany).toHaveBeenCalledTimes(1);
      expect(prisma.responseField.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            responseId: mockResponseId,
            fieldId: mockPicklistFieldId,
          }),
          data: expect.objectContaining({
            value: '',
          }),
        })
      );
    });
  });
});

// Setup a mock response with a picklist field for the edge case tests
const mockResponseWithPicklistField: Response = {
  id: 'response-id-456',
  formId: 'form-id-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  fields: [
    {
      id: 'response-field-id-123',
      responseId: 'response-id-456',
      fieldId: 'picklist-field-id-789',
      value: 'Option 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  submittedBy: 'test-user-id',
}; 
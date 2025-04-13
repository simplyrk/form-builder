/**
 * Form Builder Server Actions
 * This file contains all server-side actions for form management and response handling.
 * @module forms
 */

'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import type { Form, FormField, FormResponse, ResponseField } from '@/types/form';
import path from 'path';
import fs from 'fs/promises';
import { z } from 'zod';

interface FileUploadResult {
  path: string;
  fileName: string;
  fileSize: number;
  mimeType: string | null;
}

// Add type definitions at the top of the file
type FileMetadata = {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
};

type ResponseFieldWithFile = {
  id: string;
  fieldId: string;
  responseId: string;
  value: string;
  fileName: string | null;
  filePath: string | null;
  fileSize: number | null;
  mimeType: string | null;
};

// Remove unused type imports and variables
const formFieldSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});

/**
 * Creates a new form with the provided data
 * @param {FormInput} data - The form data including title, description, and fields
 * @returns {Promise<Form>} The created form
 * @throws {Error} If user is not authenticated
 */
export async function createForm(data: {
  title: string;
  description: string;
  fields: Omit<FormField, 'id' | 'formId' | 'createdAt' | 'updatedAt'>[];
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const form = await prisma.form.create({
      data: {
        title: data.title,
        description: data.description,
        published: false,
        createdBy: userId,
        fields: {
          create: data.fields.map((field, index) => ({
            ...field,
            order: index,
          })),
        },
      },
      include: {
        fields: true,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true, form };
  } catch (error) {
    console.error('Error creating form:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create form' 
    };
  }
}

/**
 * Updates an existing form with new data
 * @param {string} id - The ID of the form to update
 * @param {FormInput} data - The new form data
 * @returns {Promise<Form>} The updated form
 * @throws {Error} If user is not authenticated or not authorized
 */
export async function updateForm(
  formId: string,
  data: {
    title: string;
    description: string;
    published: boolean;
    fields: Omit<FormField, 'id' | 'formId' | 'createdAt' | 'updatedAt'>[];
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // First delete all existing fields
    await prisma.field.deleteMany({
      where: { formId },
    });

    // Then update the form and create new fields
    const form = await prisma.form.update({
      where: { id: formId },
      data: {
        title: data.title,
        description: data.description,
        published: data.published,
        fields: {
          create: data.fields.map((field, index) => ({
            ...field,
            order: index,
          })),
        },
      },
      include: {
        fields: true,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath(`/forms/${formId}`);

    return { success: true, form };
  } catch (error) {
    console.error('Error updating form:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update form' 
    };
  }
}

/**
 * Toggles the published state of a form
 * @param {string} formId - The ID of the form to toggle
 * @returns {Promise<Form>} The updated form
 * @throws {Error} If user is not authenticated or not authorized
 */
export async function toggleFormPublish(formId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const form = await prisma.form.findUnique({
    where: { id: formId },
  });

  if (!form || form.createdBy !== userId) {
    throw new Error('Form not found or unauthorized');
  }

  return prisma.form.update({
    where: { id: formId },
    data: { published: !form.published },
  });
}

/**
 * Deletes a form and all its associated data
 * @param {string} formId - The ID of the form to delete
 * @returns {Promise<void>}
 * @throws {Error} If user is not authenticated or not authorized
 */
export async function deleteForm(formId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // First delete all response fields
    await prisma.responseField.deleteMany({
      where: {
        response: {
          formId: formId
        }
      }
    });

    // Then delete all responses
    await prisma.response.deleteMany({
      where: {
        formId: formId
      }
    });

    // Then delete all form fields
    await prisma.field.deleteMany({
      where: {
        formId: formId
      }
    });

    // Finally delete the form
    await prisma.form.delete({
      where: { id: formId }
    });

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Error deleting form:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete form' 
    };
  }
}

/**
 * Deletes multiple form responses
 * @param {string[]} responseIds - Array of response IDs to delete
 * @returns {Promise<{success: boolean}>}
 * @throws {Error} If user is not authenticated or not authorized
 */
export async function deleteResponses(formId: string, responseIds: string[]) {
  try {
    if (!responseIds || responseIds.length === 0) {
      return { success: false, error: 'No response IDs provided' };
    }

    // First delete all response fields for these responses
    await prisma.responseField.deleteMany({
      where: {
        responseId: {
          in: responseIds
        }
      }
    });

    // Then delete the responses
    const deleteResult = await prisma.response.deleteMany({
      where: {
        id: {
          in: responseIds
        }
      }
    });

    // Revalidate all relevant paths
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath(`/forms/${formId}`);
    revalidatePath(`/forms/${formId}/responses`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting responses:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete responses' 
    };
  }
}

async function handleFileUpload(file: File): Promise<FileUploadResult> {
  try {
    // Create a unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate a unique ID for the filename
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Define paths
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, filename);
    
    console.log('Uploading file:', file.name, 'to path:', filePath);
    
    // Ensure uploads directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Write the file
    await fs.writeFile(filePath, buffer);
    
    console.log('File uploaded successfully');
    
    return {
      path: `uploads/${filename}`,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

export async function updateResponse(formId: string, responseId: string, data: FormData) {
  try {
    const response = await prisma.response.findUnique({
      where: { id: responseId },
      include: { 
        form: {
          include: {
            fields: true
          }
        }
      }
    });

    if (!response) {
      throw new Error('Response not found');
    }

    if (!response.form) {
      throw new Error('Form not found');
    }

    const fields = response.form.fields;
    if (!fields || !Array.isArray(fields)) {
      throw new Error('Form fields not found');
    }

    // First, handle file deletions
    const fileDeletions = [];
    const formDataEntries = Array.from(data.entries());
    
    for (const [key, value] of formDataEntries) {
      if (key.endsWith('_delete')) {
        fileDeletions.push(key.replace('_delete', ''));
      }
    }

    if (fileDeletions.length > 0) {
      await prisma.responseField.updateMany({
        where: {
          responseId,
          fieldId: { in: fileDeletions }
        },
        data: {
          fileName: null,
          filePath: null,
          fileSize: null,
          mimeType: null,
          value: ''
        }
      });
    }

    // Then handle regular field updates and new file uploads
    const updatedFields = [];
    
    for (const [key, value] of formDataEntries) {
      // Skip deletion markers
      if (key.endsWith('_delete')) continue;
      
      const field = fields.find(f => f.id === key);
      if (!field) continue;

      // Handle file uploads
      if (field.type === 'file' && value instanceof File) {
        const uploadResult = await handleFileUpload(value);
        updatedFields.push({
          fieldId: key,
          value: uploadResult.path,
          fileName: uploadResult.fileName,
          filePath: uploadResult.path,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType
        });
      } else if (key.endsWith('_fileName') || key.endsWith('_filePath') || 
                 key.endsWith('_fileSize') || key.endsWith('_mimeType')) {
        // Skip these as they're handled with the main field
      } else {
        // Handle non-file fields
        updatedFields.push({
          fieldId: key,
          value: value.toString()
        });
      }
    }

    // Update remaining fields one by one
    if (updatedFields.length > 0) {
      for (const field of updatedFields) {
        await prisma.responseField.updateMany({
          where: { 
            responseId,
            fieldId: field.fieldId
          },
          data: {
            value: field.value,
            ...(field.fileName && {
              fileName: field.fileName,
              filePath: field.filePath,
              fileSize: field.fileSize,
              mimeType: field.mimeType
            })
          }
        });
      }
    }

    // Revalidate the correct paths
    revalidatePath(`/admin/forms/${formId}`);
    revalidatePath(`/admin/forms/${formId}/responses`);
    revalidatePath(`/admin/forms/${formId}/responses/${responseId}`);
    revalidatePath(`/admin/forms/${formId}/responses/${responseId}/edit`);

    return { success: true };
  } catch (error) {
    console.error('Error updating response:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update response' 
    };
  }
}

export async function submitResponse(
  formId: string,
  data: Record<string, string | string[] | File>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { fields: true },
    });

    if (!form) {
      return { success: false, error: 'Form not found' };
    }

    // Create the response first
    const response = await prisma.response.create({
      data: {
        formId,
        submittedBy: userId,
        fields: {
          create: form.fields.map(field => {
            const value = data[field.id];
            return {
              fieldId: field.id,
              value: Array.isArray(value) ? value.join(',') : value?.toString() || '',
              field: {
                connect: {
                  id: field.id
                }
              }
            };
          }),
        },
      },
      include: {
        fields: true,
      },
    });

    revalidatePath('/');
    revalidatePath(`/forms/${formId}`);

    return { success: true, response };
  } catch (error) {
    console.error('Error submitting response:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit response' 
    };
  }
} 
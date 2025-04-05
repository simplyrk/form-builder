'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import type { Form, FormInput, FieldInput } from '@/types/form';
import { handleFileUpload } from '@/lib/file-upload';

export async function createForm(data: FormInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const form = await prisma.form.create({
    data: {
      title: data.title,
      description: data.description,
      createdBy: userId,
      fields: {
        create: data.fields.map((field, index) => ({
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options,
          order: index,
        })),
      },
    },
    include: {
      fields: true,
    },
  });

  revalidatePath('/admin');
  return form as Form;
}

export async function updateForm(id: string, data: FormInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // First verify that the form belongs to the user
  const form = await prisma.form.findUnique({
    where: { id },
    include: { fields: true },
  });

  if (!form || form.createdBy !== userId) {
    throw new Error('Unauthorized');
  }

  // Delete existing fields
  await prisma.field.deleteMany({
    where: { formId: id },
  });

  // Update form and create new fields
  const updatedForm = await prisma.form.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      fields: {
        create: data.fields.map((field, index) => ({
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options,
          order: index,
        })),
      },
    },
    include: {
      fields: true,
    },
  });

  revalidatePath('/admin');
  return updatedForm as Form;
}

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

export async function deleteForm(formId: string) {
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

  // Delete everything in the correct order using a transaction
  await prisma.$transaction(async (tx) => {
    // Get all response IDs for this form
    const responses = await tx.response.findMany({
      where: { formId },
      select: { id: true },
    });
    const responseIds = responses.map((r: { id: string }) => r.id);

    // Delete response fields
    await tx.responseField.deleteMany({
      where: { responseId: { in: responseIds } },
    });

    // Delete responses
    await tx.response.deleteMany({
      where: { formId },
    });

    // Delete form fields
    await tx.field.deleteMany({
      where: { formId },
    });

    // Finally delete the form
    await tx.form.delete({
      where: { id: formId },
    });
  });
}

export async function deleteResponses(responseIds: string[]) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Get the form IDs for these responses
  const responses = await prisma.response.findMany({
    where: { id: { in: responseIds } },
    select: { formId: true },
  });

  // Verify the user owns all the forms
  const formIds = [...new Set(responses.map(r => r.formId))];
  const forms = await prisma.form.findMany({
    where: { id: { in: formIds } },
    select: { id: true, createdBy: true },
  });

  const unauthorizedForms = forms.filter(form => form.createdBy !== userId);
  if (unauthorizedForms.length > 0) {
    throw new Error('Unauthorized to delete responses from some forms');
  }

  // Delete everything in the correct order using a transaction
  await prisma.$transaction(async (tx) => {
    // First delete the response fields
    await tx.responseField.deleteMany({
      where: { responseId: { in: responseIds } },
    });

    // Then delete the responses
    await tx.response.deleteMany({
      where: { id: { in: responseIds } },
    });
  });

  return { success: true };
}

export async function updateResponse(responseId: string, fieldValues: Record<string, any> | FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const existingResponse = await prisma.response.findUnique({
    where: { id: responseId },
    include: {
      form: true,
    },
  });

  if (!existingResponse) {
    throw new Error('Response not found');
  }

  // Check if user is authorized to update this response
  if (existingResponse.submittedBy !== userId) {
    // Check if user is the form creator (admin)
    const form = await prisma.form.findUnique({
      where: { id: existingResponse.formId }
    });
    
    if (!form || form.createdBy !== userId) {
      throw new Error('Not authorized to update this response');
    }
  }

  // Get existing response fields to preserve file data
  const existingFields = await prisma.responseField.findMany({
    where: { responseId },
  });

  // Process FormData if received
  const processedFields: Record<string, string> = {};
  const filesToDelete: string[] = [];
  const fieldsToKeep: string[] = [];
  
  if (fieldValues instanceof FormData) {
    // Process form data entries
    for (const [key, value] of fieldValues.entries()) {
      if (key.endsWith('_delete') && value === 'true') {
        // Mark field for deletion
        const fieldId = key.replace('_delete', '');
        filesToDelete.push(fieldId);
      } else if (value instanceof File) {
        // Handle file upload
        const fileMetadata = await handleFileUpload(value);
        console.log('File uploaded:', fileMetadata);
        
        // Ensure file path starts with a slash
        const filePath = fileMetadata.filePath.startsWith('/') 
          ? fileMetadata.filePath 
          : `/${fileMetadata.filePath}`;
        
        // Get the response field to update with file metadata
        const responseField = await prisma.responseField.findFirst({
          where: {
            responseId,
            fieldId: key,
          },
        });
        
        if (responseField) {
          // Update existing field with new file data
          await prisma.responseField.update({
            where: { id: responseField.id },
            data: {
              fileName: fileMetadata.fileName,
              filePath: filePath,
              fileSize: fileMetadata.fileSize,
              mimeType: fileMetadata.mimeType,
              value: filePath, // Ensure the value field also contains the file path
            } as any,
          });
          console.log('Updated response field:', responseField.id, 'with file path:', filePath);
        } else {
          // Create new field with file data
          const newField = await prisma.responseField.create({
            data: {
              responseId,
              fieldId: key,
              value: filePath,
              fileName: fileMetadata.fileName,
              filePath: filePath,
              fileSize: fileMetadata.fileSize,
              mimeType: fileMetadata.mimeType,
            } as any,
          });
          console.log('Created new response field:', newField.id, 'with file path:', filePath);
        }
        
        // Add to processed fields to prevent deletion
        processedFields[key] = filePath;
      } else {
        // Regular field
        processedFields[key] = value.toString();
      }
    }
  } else {
    // Handle regular object
    Object.entries(fieldValues).forEach(([key, value]) => {
      if (value === null) {
        filesToDelete.push(key);
      } else {
        processedFields[key] = String(value);
      }
    });
  }
  
  // Identify fields that should be kept (not deleted or updated)
  existingFields.forEach(field => {
    // If the field has file data and is not in the processed fields or deletion list,
    // we should keep it
    if ((field as any).filePath && 
        !processedFields[field.fieldId] && 
        !filesToDelete.includes(field.fieldId)) {
      fieldsToKeep.push(field.fieldId);
    }
  });
  
  // Handle file deletions
  if (filesToDelete.length > 0) {
    for (const fieldId of filesToDelete) {
      const responseField = await prisma.responseField.findFirst({
        where: {
          responseId,
          fieldId,
        },
      });
      
      if (responseField) {
        // Reset file-related fields
        await prisma.responseField.update({
          where: { id: responseField.id },
          data: {
            fileName: null,
            filePath: null,
            fileSize: null,
            mimeType: null,
            value: '',
          } as any,
        });
        console.log('Deleted file from response field:', responseField.id);
      }
    }
  }

  // Delete existing response fields (except those with files we're keeping)
  await prisma.responseField.deleteMany({
    where: { 
      responseId,
      fieldId: {
        notIn: [...filesToDelete, ...fieldsToKeep],
      },
    },
  });

  // Create new response fields
  if (Object.keys(processedFields).length > 0) {
    // We need to track which fields have file data separately
    const fileFields = new Set<string>();
    
    // First create regular text fields without file data
    const fieldsToCreate = Object.entries(processedFields)
      .filter(([fieldId, value]) => {
        // Check if this is a file field (filePath starts with / or /uploads/)
        const isFileField = typeof value === 'string' && 
          (value.startsWith('/uploads/') || value.startsWith('uploads/'));
        
        if (isFileField) {
          fileFields.add(fieldId);
          return false; // Filter out file fields for now
        }
        return true; // Keep non-file fields
      })
      .map(([fieldId, value]) => ({
        responseId,
        fieldId,
        value,
      }));
    
    if (fieldsToCreate.length > 0) {
      await prisma.responseField.createMany({
        data: fieldsToCreate,
      });
      console.log('Created regular fields:', fieldsToCreate);
    }
    
    // Now handle file fields individually to include file metadata
    for (const fieldId of fileFields) {
      const value = processedFields[fieldId];
      console.log('Creating file field:', fieldId, 'with value:', value);
      
      // Parse the file path
      const filePath = typeof value === 'string' ? value : '';
      const fileName = filePath.split('/').pop() || '';
      
      // Create the field with file metadata
      const field = await prisma.responseField.create({
        data: {
          responseId,
          fieldId,
          value: filePath,
          fileName: fileName,
          filePath: filePath,
          fileSize: 0, // We don't have this info at this point
          mimeType: '', // We don't have this info at this point
        } as any,
      });
      
      console.log('Created file field with ID:', field.id);
    }
  }

  // Verify the response fields after update
  const updatedFields = await prisma.responseField.findMany({
    where: { responseId },
  });
  console.log('Response fields after update:', updatedFields.map(f => ({
    fieldId: f.fieldId,
    value: f.value,
    filePath: (f as any).filePath,
  })));

  return { success: true };
}

export async function submitResponse(formId: string, formData: Record<string, any>) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    // Define a type for file metadata
    type FileMetadata = {
      fileName: string;
      filePath: string;
      fileSize: number;
      mimeType: string;
    };

    // Process form data to handle file uploads
    const processedFields = await Promise.all(
      Object.entries(formData).map(async ([fieldId, value]) => {
        // Check if the value is a File object
        if (value instanceof File) {
          const fileMetadata = await handleFileUpload(value);
          return {
            fieldId,
            value: fileMetadata.filePath, // Store the file path as the value
            fileMetadata, // Store the full metadata separately
          };
        }
        
        // For non-file fields, just return the value as a string
        return {
          fieldId,
          value: String(value),
        };
      })
    );

    // Create the response with basic field data
    const response = await prisma.response.create({
      data: {
        formId,
        submittedBy: userId,
        fields: {
          create: processedFields.map(field => ({
            fieldId: field.fieldId,
            value: field.value,
          })),
        },
      },
    });

    // Update the response fields with file metadata if needed
    const fileFields = processedFields.filter((field): field is { 
      fieldId: string; 
      value: string; 
      fileMetadata: FileMetadata 
    } => 'fileMetadata' in field);
    
    if (fileFields.length > 0) {
      await Promise.all(
        fileFields.map(async (field) => {
          const responseField = await prisma.responseField.findFirst({
            where: {
              responseId: response.id,
              fieldId: field.fieldId,
            },
          });

          if (responseField) {
            await prisma.responseField.update({
              where: { id: responseField.id },
              data: {
                fileName: field.fileMetadata.fileName,
                filePath: field.fileMetadata.filePath,
                fileSize: field.fileMetadata.fileSize,
                mimeType: field.fileMetadata.mimeType,
              } as any, // Use type assertion to bypass type checking
            });
          }
        })
      );
    }

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
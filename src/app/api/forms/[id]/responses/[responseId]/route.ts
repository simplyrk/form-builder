import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateResponse } from '@/app/actions/forms';
import { revalidatePath } from 'next/cache';

/**
 * API handler for updating a form response
 * @param {NextRequest} request - The Next.js request object
 * @param {Object} params - The route parameters
 * @param {string} params.id - The form ID
 * @param {string} params.responseId - The response ID
 * @returns {NextResponse} The response with the updated form response
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; responseId: string } }
) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the form data from the request
    const formData = await request.formData();
    
    console.log('Updating response:', params.responseId, 'for form:', params.id);
    console.log('Form data entries:', Array.from(formData.entries()).map(([key, value]) => {
      if (value instanceof File) {
        return [key, { name: value.name, size: value.size, type: value.type }];
      }
      return [key, value];
    }));

    // Update the response
    const result = await updateResponse(params.id, params.responseId, formData);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Revalidate the form and response pages
    revalidatePath(`/admin/forms/${params.id}`);
    revalidatePath(`/admin/forms/${params.id}/responses`);
    revalidatePath(`/admin/forms/${params.id}/responses/${params.responseId}`);
    revalidatePath(`/admin/forms/${params.id}/responses/${params.responseId}/edit`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating response:', error);
    return NextResponse.json(
      { error: 'Failed to update response' },
      { status: 500 }
    );
  }
} 
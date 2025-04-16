import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';

import { updateResponse } from '@/app/actions/forms';


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

    // Properly await the params object as required by Next.js 13+
    const { id: formId, responseId } = await Promise.resolve(params);

    // Update the response
    const result = await updateResponse(formId, responseId, formData);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Revalidate the form and response pages
    revalidatePath(`/forms/${formId}`);
    revalidatePath(`/forms/${formId}/responses`);
    revalidatePath(`/forms/${formId}/responses/${responseId}`);
    revalidatePath(`/forms/${formId}/responses/${responseId}/edit`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating response:', error);
    return NextResponse.json(
      { error: 'Failed to update response' },
      { status: 500 }
    );
  }
} 
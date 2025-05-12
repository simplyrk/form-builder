import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

/**
 * API handler for getting detailed information about a specific form response
 * This endpoint is used for displaying linked submission details
 * 
 * @param {Request} request - The request object
 * @param {Object} params - The route parameters
 * @param {string} params.id - The form ID
 * @param {string} params.responseId - The response ID
 * @returns {NextResponse} The response with the form response details
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string; responseId: string } }
) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Properly await the params object as required by Next.js
    const { id: formId, responseId } = await Promise.resolve(params);

    // Validate parameters
    if (!formId || !responseId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get form and check access
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { 
        id: true, 
        title: true,
        createdBy: true, 
        published: true,
        fields: {
          select: {
            id: true,
            label: true,
            type: true,
            required: true,
            order: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this form
    if (form.createdBy !== userId && !form.published) {
      return NextResponse.json(
        { error: "Not authorized to access this form" },
        { status: 403 }
      );
    }

    // Get the response with its fields
    const response = await prisma.response.findUnique({
      where: {
        id: responseId,
        formId: formId
      },
      select: {
        id: true,
        createdAt: true,
        fields: {
          select: {
            id: true,
            fieldId: true,
            value: true,
            fileName: true,
            filePath: true,
            mimeType: true
          }
        }
      }
    });

    if (!response) {
      return NextResponse.json(
        { error: "Response not found" },
        { status: 404 }
      );
    }

    // Combine form fields with response data for a more useful response
    const formattedResponse = {
      id: response.id,
      formId: formId,
      formTitle: form.title,
      createdAt: response.createdAt,
      updatedAt: response.createdAt, // Use createdAt as updatedAt since it's not available
      fields: form.fields.map(field => {
        const responseField = response.fields.find(rf => rf.fieldId === field.id);
        return {
          id: field.id,
          label: field.label,
          type: field.type,
          value: responseField?.value || '',
          fileName: responseField?.fileName || null,
          filePath: responseField?.filePath || null,
          mimeType: responseField?.mimeType || null
        };
      })
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Error fetching response details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch response details' },
      { status: 500 }
    );
  }
}

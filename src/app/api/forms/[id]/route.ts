import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// Define interface for linked form type
interface LinkedForm {
  id: string;
  title: string;
  fields: {
    id: string;
    label: string;
    type: string;
  }[];
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const { id } = params;
    
    // Get form with fields
    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
    
    // Check if form exists
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    // Check if user has access to the form
    if (!form.published && form.createdBy !== userId) {
      return NextResponse.json(
        { error: "Not authorized to access this form" },
        { status: 403 }
      );
    }
    
    // Find linked forms for any linkedSubmission fields
    const linkedFormIds = form.fields
      .filter(field => field.type === 'linkedSubmission' && field.linkedFormId)
      .map(field => field.linkedFormId as string);
      
    let linkedForms: LinkedForm[] = [];
    
    if (linkedFormIds.length > 0) {
      linkedForms = await prisma.form.findMany({
        where: {
          id: {
            in: linkedFormIds,
          },
          OR: [
            { published: true },
            { createdBy: userId as string },
          ],
        },
        select: {
          id: true,
          title: true,
          fields: {
            select: {
              id: true,
              label: true,
              type: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    }
    
    return NextResponse.json({
      ...form,
      linkedForms,
    });
  } catch (error) {
    console.error("Error getting form:", error);
    return NextResponse.json(
      { error: "Error getting form" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const { id } = params;
    const data = await request.json();
    
    // Get existing form
    const existingForm = await prisma.form.findUnique({
      where: { id },
      select: {
        createdBy: true,
      },
    });
    
    // Check if form exists
    if (!existingForm) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    
    // Check if user is the creator of the form
    if (existingForm.createdBy !== userId) {
      return NextResponse.json(
        { error: "Not authorized to update this form" },
        { status: 403 }
      );
    }
    
    // Update the form
    const { fields, ...formData } = data;
    
    // Transaction to update form and fields
    const result = await prisma.$transaction(async (tx) => {
      // Update form
      const updatedForm = await tx.form.update({
        where: { id },
        data: formData,
      });
      
      // Delete existing fields
      await tx.field.deleteMany({
        where: { formId: id },
      });
      
      // Create new fields
      if (fields && fields.length > 0) {
        await tx.field.createMany({
          data: fields.map((field: any) => ({
            ...field,
            formId: id,
          })),
        });
      }
      
      return updatedForm;
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json(
      { error: "Error updating form" },
      { status: 500 }
    );
  }
} 
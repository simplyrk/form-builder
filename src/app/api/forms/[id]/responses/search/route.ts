import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

/**
 * CORS headers for the response
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication for all search requests
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing form ID" },
        { status: 400 }
      );
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid form ID format" },
        { status: 400 }
      );
    }

    // Get form and check access
    const form = await prisma.form.findUnique({
      where: { id },
      select: { id: true, createdBy: true, published: true },
    });
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }
    if (form.createdBy !== userId && !form.published) {
      return NextResponse.json(
        { error: "Not authorized to access this form" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    // Count responses
    const responseCount = await prisma.response.count({
      where: { formId: id }
    });
    if (responseCount === 0) {
      return NextResponse.json(
        [],
        { headers: { 'X-Form-Has-Responses': 'false' } }
      );
    }

    // Fetch matching responses
    const responses = await prisma.response.findMany({
      where: {
        formId: id,
        fields: {
          some: {
            value: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        fields: {
          select: {
            id: true,
            fieldId: true,
            value: true,
          },
        },
      },
      take: 10,
    });

    return NextResponse.json(responses, {
      headers: {
        'X-Form-Has-Responses': 'true',
        'X-Results-Count': responses.length.toString(),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error searching responses: ${errorMessage}`, error);
    return NextResponse.json(
      { error: "Error searching responses", details: errorMessage },
      { status: 500 }
    );
  }
} 
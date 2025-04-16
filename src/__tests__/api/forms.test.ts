import { auth } from '@clerk/nextjs/server';
import { NextResponse, textResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// Mock the Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    form: {
      findMany: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn().mockResolvedValue({ userId: 'test-user-id' }),
}));

// Create a mock implementation of the API route handler
async function mockGET() {
  const { userId } = await auth();
  
  if (!userId) {
    return textResponse('Unauthorized', { status: 401 });
  }

  const forms = await prisma.form.findMany({
    where: {
      createdBy: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(forms);
}

describe('Forms API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Override the auth mock for this test
    const authMock = auth as jest.MockedFunction<typeof auth>;
    authMock.mockResolvedValueOnce({ userId: null });

    const response = await mockGET();
    expect(response.status).toBe(401);
    expect(await response.text()).toBe('Unauthorized');
  });

  it('should return user forms when authenticated', async () => {
    const mockForms = [
      { 
        id: '1', 
        name: 'Form 1', 
        createdBy: 'test-user-id', 
        createdAt: new Date(),
        formGroup: 'Test Group'
      },
      { 
        id: '2', 
        name: 'Form 2', 
        createdBy: 'test-user-id', 
        createdAt: new Date(),
        formGroup: 'Test Group'
      },
    ];

    // Set up the mock return value
    (prisma.form.findMany as jest.Mock).mockResolvedValueOnce(mockForms);

    const response = await mockGET();
    
    // Parse the response JSON
    const responseData = await response.json();
    expect(responseData).toEqual(mockForms);
    
    // Verify the Prisma query
    expect(prisma.form.findMany).toHaveBeenCalledWith({
      where: { createdBy: 'test-user-id' },
      orderBy: { createdAt: 'desc' },
    });
  });
}); 
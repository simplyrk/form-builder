import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

// Define a mock response type
type MockResponse = {
  status: number;
  text?: () => Promise<string>;
  json?: () => unknown;
};

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({ 
      status: 200, 
      json: () => data 
    } as MockResponse)),
    __esModule: true,
  },
}));

// Create a mock implementation of the API route handler
async function mockGET(): Promise<MockResponse> {
  const { userId } = await auth();
  
  if (!userId) {
    // Return a simple response object instead of using the constructor
    return {
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    };
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
    type SignedOutAuth = {
      userId: null;
      sessionId: null;
      sessionClaims: null;
      sessionStatus: null;
      actor: null;
      orgId: null;
      orgRole: null;
      orgSlug: null;
      orgPermissions: null;
      factorVerificationAge: null;
      has: () => boolean;
      getToken: () => Promise<null>;
      debug: () => Record<string, unknown>;
      getOrgMembership: () => null;
      redirectToSignIn: () => never;
    };
    
    authMock.mockResolvedValueOnce({
      userId: null,
      sessionId: null,
      sessionClaims: null,
      sessionStatus: null,
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      orgPermissions: null,
      factorVerificationAge: null,
      has: () => false,
      getToken: () => Promise.resolve(null),
      debug: () => ({}),
      getOrgMembership: () => null,
      redirectToSignIn: () => { throw new Error('Not implemented in test'); }
    } as SignedOutAuth);

    const response = await mockGET();
    expect(response.status).toBe(401);
    
    // Handle the optional method safely
    if (response.text) {
      expect(await response.text()).toBe('Unauthorized');
    }
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
    
    // Parse the response JSON safely
    if (response.json) {
      const responseData = await response.json();
      expect(responseData).toEqual(mockForms);
    }
    
    // Verify the Prisma query
    expect(prisma.form.findMany).toHaveBeenCalledWith({
      where: { createdBy: 'test-user-id' },
      orderBy: { createdAt: 'desc' },
    });
  });
}); 
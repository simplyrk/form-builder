import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(() => ({
    isLoaded: true,
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    getToken: jest.fn().mockResolvedValue('test-token'),
  })),
  auth: jest.fn().mockReturnValue({
    userId: 'test-user-id',
  }),
}))

// Mock next/server Response object
jest.mock('next/server', () => {
  const jsonResponse = (data) => ({
    status: 200,
    json: async () => data,
    headers: new Map(),
    text: async () => JSON.stringify(data),
  });
  
  const textResponse = (text, options = {}) => ({
    status: options.status || 200,
    json: async () => { throw new Error('Not a JSON response'); },
    headers: new Map(),
    text: async () => text,
  });
  
  return { 
    NextResponse: {
      json: jest.fn(jsonResponse),
      next: jest.fn(),
      redirect: jest.fn(),
    },
    textResponse,
  };
}); 
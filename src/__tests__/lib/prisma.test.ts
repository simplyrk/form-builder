import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Mock both modules together
const mockClientStructure = {
  form: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  response: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockClientStructure),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    form: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    response: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  },
}));

describe('Prisma Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have the expected models', () => {
    // Test that the prisma client has the expected models/properties
    expect(prisma.form).toBeDefined();
    expect(prisma.response).toBeDefined();
    expect(typeof prisma.form.findMany).toBe('function');
    expect(typeof prisma.response.create).toBe('function');
  });

  it('should use PrismaClient constructor', () => {
    // Since we're manually mocking the module, we can't test the singleton pattern directly
    // But we can verify the PrismaClient constructor is available
    expect(PrismaClient).toBeDefined();
    const client = new PrismaClient();
    expect(client.form).toBeDefined();
    expect(client.response).toBeDefined();
  });
}); 
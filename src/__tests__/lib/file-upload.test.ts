import { v4 as uuidv4 } from 'uuid';

// Mock dependencies
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid-value'),
}));

// Mock the logger
jest.mock('@/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

// Mock file-scanner 
jest.mock('@/lib/file-scanner', () => ({
  scanFile: jest.fn().mockResolvedValue({ safe: true, message: 'All security scans passed' }),
}));

// Import from test version instead of the regular module
import { 
  generateUniqueFilename, 
  validateFile 
} from '@/lib/file-upload-test';

// Mock environment variables
const originalEnv = process.env;

describe('File Upload Utilities', () => {
  describe('generateUniqueFilename', () => {
    it('should generate a unique filename with the original extension', () => {
      const result = generateUniqueFilename('test-file.jpg');
      expect(result).toBe('mock-uuid-value.jpg');
      expect(uuidv4).toHaveBeenCalledTimes(1);
    });

    it('should handle filenames without extensions', () => {
      const result = generateUniqueFilename('test-file');
      // With our updated implementation, it should just return the uuid if no extension
      expect(result).toBe('mock-uuid-value');
    });
  });

  describe('validateFile', () => {
    // Mock implementation of File for testing
    class MockFile {
      name: string;
      size: number;
      type: string;
      
      constructor(name: string, size: number, type: string) {
        this.name = name;
        this.size = size;
        this.type = type;
      }
      
      arrayBuffer() {
        return Promise.resolve(new ArrayBuffer(this.size));
      }
    }
    
    beforeEach(() => {
      // Reset environment variables for each test
      process.env = { ...originalEnv };
      process.env.MAX_FILE_SIZE = '10485760'; // 10MB
      process.env.ALLOWED_FILE_TYPES = 'image/jpeg,image/png,application/pdf';
      
      // Reset mock state between tests
      jest.clearAllMocks();
    });
    
    afterAll(() => {
      // Restore original env
      process.env = originalEnv;
    });
    
    it('should validate a valid file', async () => {
      const file = new MockFile('test.jpg', 1000000, 'image/jpeg') as unknown as File;
      const result = await validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should reject files that are too large', async () => {
      const file = new MockFile('big.jpg', 20000000, 'image/jpeg') as unknown as File;
      const result = await validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds the maximum allowed size');
    });
    
    it('should reject files with disallowed MIME types', async () => {
      const file = new MockFile('script.js', 1000, 'application/javascript') as unknown as File;
      const result = await validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File type application/javascript is not allowed');
    });
    
    it('should reject files with dangerous extensions', async () => {
      // Create a mock file with a dangerous extension but allowed MIME type
      const file = new MockFile('malicious.php', 1000, 'image/jpeg') as unknown as File;
      const result = await validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File extension .php is not allowed for security reasons');
    });
  });
}); 
/**
 * File Scanning Utility
 * This module provides virus/malware scanning capabilities for uploaded files.
 * @module file-scanner
 */

import { promises as fs } from 'fs';
import crypto from 'crypto';
import path from 'path';

/**
 * Types of scanning available
 */
export enum ScanType {
  CONTENT_ANALYSIS = 'content-analysis',
  HASH_VERIFICATION = 'hash-verification',
  EXTENSION_VALIDATION = 'extension-validation',
  MAGIC_BYTES = 'magic-bytes',
}

/**
 * Configuration for file scanning
 */
interface ScanConfig {
  enabled: boolean;
  scanTypes: ScanType[];
  hashDatabase?: Map<string, boolean>; // MD5 hash to threat status (true = malicious)
}

/**
 * Result of a file scan
 */
export interface ScanResult {
  safe: boolean;
  threatType?: string;
  message?: string;
}

/**
 * Default scanning configuration
 */
const defaultScanConfig: ScanConfig = {
  enabled: process.env.ENABLE_FILE_SCANNING === 'true',
  scanTypes: [
    ScanType.EXTENSION_VALIDATION,
    ScanType.MAGIC_BYTES,
    ScanType.CONTENT_ANALYSIS,
  ],
  hashDatabase: new Map()
};

/**
 * Known file signatures (magic bytes/numbers) for common file types
 * Format: [offset, hexSignature, description]
 */
const FILE_SIGNATURES: [number, string, string][] = [
  [0, 'FFD8FF', 'JPEG image'],
  [0, '89504E47', 'PNG image'],
  [0, '47494638', 'GIF image'],
  [0, '25504446', 'PDF document'],
  [0, '504B0304', 'ZIP archive/Office document'],
  // Add more signatures as needed
];

/**
 * Scans a file for viruses and malware
 * @param {string} filePath - Path to the file to scan
 * @param {ScanConfig} config - Scanning configuration
 * @returns {Promise<ScanResult>} Result of the scan
 */
export async function scanFile(
  filePath: string, 
  config: ScanConfig = defaultScanConfig
): Promise<ScanResult> {
  if (!config.enabled) {
    return { safe: true, message: 'File scanning is disabled' };
  }

  try {
    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    const fileExt = path.extname(filePath).toLowerCase();
    
    // Track scan results
    const scanResults: { type: ScanType, safe: boolean, message?: string }[] = [];
    
    // 1. Perform extension validation
    if (config.scanTypes.includes(ScanType.EXTENSION_VALIDATION)) {
      const extensionResult = validateFileExtension(fileExt);
      scanResults.push({
        type: ScanType.EXTENSION_VALIDATION,
        ...extensionResult
      });
      
      // If this basic check fails, no need to continue with more expensive scans
      if (!extensionResult.safe) {
        return {
          safe: false,
          threatType: 'Potentially dangerous file type',
          message: extensionResult.message
        };
      }
    }
    
    // 2. Verify magic bytes/file signatures
    if (config.scanTypes.includes(ScanType.MAGIC_BYTES)) {
      const signatureResult = verifyFileSignature(fileBuffer, fileExt);
      scanResults.push({
        type: ScanType.MAGIC_BYTES,
        ...signatureResult
      });
      
      // If file signature doesn't match extension, it's suspicious
      if (!signatureResult.safe) {
        return {
          safe: false,
          threatType: 'File signature mismatch',
          message: signatureResult.message
        };
      }
    }
    
    // 3. Analyze file content for suspicious patterns
    if (config.scanTypes.includes(ScanType.CONTENT_ANALYSIS)) {
      const contentResult = analyzeFileContent(fileBuffer, fileExt);
      scanResults.push({
        type: ScanType.CONTENT_ANALYSIS,
        ...contentResult
      });
      
      if (!contentResult.safe) {
        return {
          safe: false,
          threatType: 'Suspicious content detected',
          message: contentResult.message
        };
      }
    }
    
    // 4. Check file hash against known malware hashes
    if (config.scanTypes.includes(ScanType.HASH_VERIFICATION) && config.hashDatabase) {
      const hashResult = verifyFileHash(fileBuffer, config.hashDatabase);
      scanResults.push({
        type: ScanType.HASH_VERIFICATION,
        ...hashResult
      });
      
      if (!hashResult.safe) {
        return {
          safe: false,
          threatType: 'Known malware signature',
          message: hashResult.message
        };
      }
    }
    
    // If all scans passed, the file is considered safe
    return { 
      safe: true,
      message: 'All security scans passed'
    };
  } catch (error) {
    console.error('Error scanning file:', error);
    // Fail closed - if scanning fails, we don't allow the file
    return { 
      safe: false,
      threatType: 'Scan failure',
      message: 'Unable to complete security scan'
    };
  }
}

/**
 * Validates a file extension against a list of dangerous extensions
 * @param {string} extension - The file extension to validate
 * @returns {ScanResult} Result of the validation
 */
function validateFileExtension(extension: string): ScanResult {
  const dangerousExtensions = [
    '.exe', '.dll', '.bat', '.cmd', '.msi', '.sh', 
    '.php', '.phtml', '.jsp', '.asp', '.aspx', '.cgi',
    '.js', '.vbs', '.ps1', '.py'
  ];
  
  if (dangerousExtensions.includes(extension)) {
    return {
      safe: false,
      message: `File extension ${extension} is not allowed for security reasons`
    };
  }
  
  return { safe: true };
}

/**
 * Verifies that a file's signature matches its extension
 * @param {Buffer} fileBuffer - The file buffer to check
 * @param {string} fileExt - The file extension
 * @returns {ScanResult} Result of the verification
 */
function verifyFileSignature(fileBuffer: Buffer, fileExt: string): ScanResult {
  if (fileBuffer.length < 8) {
    return {
      safe: false,
      message: 'File is too small to determine signature'
    };
  }
  
  // Convert the file's first bytes to hex for comparison
  const fileSignature = fileBuffer.slice(0, 8).toString('hex').toUpperCase();
  
  // Map extensions to expected signatures
  const extensionSignatures: Record<string, string[]> = {
    '.jpg': ['FFD8FF'],
    '.jpeg': ['FFD8FF'],
    '.png': ['89504E47'],
    '.gif': ['47494638'],
    '.pdf': ['25504446'],
    '.docx': ['504B0304'],
    '.xlsx': ['504B0304'],
    '.pptx': ['504B0304'],
    '.zip': ['504B0304'],
  };
  
  // Check if the file extension has expected signatures
  const expectedSignatures = extensionSignatures[fileExt];
  if (expectedSignatures) {
    if (!expectedSignatures.some(sig => fileSignature.startsWith(sig))) {
      return {
        safe: false,
        message: `File signature doesn't match ${fileExt} extension`
      };
    }
  }
  
  return { safe: true };
}

/**
 * Analyzes file content for suspicious patterns
 * @param {Buffer} fileBuffer - The file buffer to analyze
 * @param {string} fileExt - The file extension
 * @returns {ScanResult} Result of the analysis
 */
function analyzeFileContent(fileBuffer: Buffer, fileExt: string): ScanResult {
  // Convert buffer to string for pattern matching
  // Note: This is simplified and would miss binary patterns
  const fileContent = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 10000));
  
  // Suspicious patterns that might indicate malicious code
  const suspiciousPatterns = [
    // Scripts
    /<script.*?>.*?<\/script>/i,
    /eval\s*\(/i,
    /document\.write\s*\(/i,
    /fromCharCode/i,
    
    // Command execution
    /exec\s*\(/i,
    /spawn\s*\(/i,
    /system\s*\(/i,
    
    // PHP code in non-PHP files
    /\<\?php/i,
    
    // Base64 encoded executable content
    /TVqQAAMAAAA/i, // DOS MZ header in base64
    
    // Shellcode patterns
    /\\x[0-9a-f]{2}\\x[0-9a-f]{2}\\x[0-9a-f]{2}\\x[0-9a-f]{2}/i,
  ];
  
  // Check if file content matches any suspicious patterns
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fileContent)) {
      return {
        safe: false,
        message: 'File contains suspicious code patterns'
      };
    }
  }
  
  return { safe: true };
}

/**
 * Verifies a file's hash against a database of known malware hashes
 * @param {Buffer} fileBuffer - The file buffer to check
 * @param {Map<string, boolean>} hashDatabase - Database of known hashes
 * @returns {ScanResult} Result of the verification
 */
function verifyFileHash(fileBuffer: Buffer, hashDatabase: Map<string, boolean>): ScanResult {
  // Create MD5 hash of the file
  const md5Hash = crypto
    .createHash('md5')
    .update(fileBuffer)
    .digest('hex');
  
  // Check if the hash is in the database of known malware
  if (hashDatabase.has(md5Hash) && hashDatabase.get(md5Hash)) {
    return {
      safe: false,
      message: 'File matches a known malware signature'
    };
  }
  
  return { safe: true };
}

/**
 * Updates the hash database with new malware signatures
 * @param {Map<string, boolean>} hashDatabase - The database to update
 * @param {Record<string, boolean>} newHashes - New hashes to add
 * @returns {Map<string, boolean>} The updated database
 */
export function updateHashDatabase(
  hashDatabase: Map<string, boolean>,
  newHashes: Record<string, boolean>
): Map<string, boolean> {
  Object.entries(newHashes).forEach(([hash, isMalicious]) => {
    hashDatabase.set(hash, isMalicious);
  });
  return hashDatabase;
}

// Export default config for convenience
export const scanConfig = defaultScanConfig; 
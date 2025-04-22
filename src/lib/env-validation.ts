/**
 * Environment Variable Validation
 * 
 * This module validates that all required environment variables are set
 * before the application starts or during build time.
 */

// Define the required environment variables
export const REQUIRED_ENV_VARS = [
  // Database
  'DATABASE_URL',
  
  // Authentication
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  
  // These have defaults in file-upload.ts so we don't need to enforce them
  // 'STORAGE_DIR',
  // 'TEMP_DIR',
  // 'MAX_FILE_SIZE',
  // 'ALLOWED_FILE_TYPES',
  // 'ENABLE_FILE_SCANNING',
];

/**
 * Validates that all required environment variables are set
 * @returns {Array<string>} Array of missing environment variables (empty if all are set)
 */
export function validateEnvVars(): string[] {
  const missingVars: string[] = [];
  
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  return missingVars;
}

/**
 * Validates environment variables and throws an error if any are missing
 * @throws {Error} If any required environment variables are missing
 */
export function validateEnvOrExit(): void {
  const missingVars = validateEnvVars();
  
  if (missingVars.length > 0) {
    const errorMessage = `
Missing required environment variables:
${missingVars.map(v => `  - ${v}`).join('\n')}

Please ensure all required environment variables are set in your .env file,
or use the .env.example file as a template.
    `.trim();
    
    // Log the error and exit with a non-zero status code
    console.error('\x1b[31m%s\x1b[0m', errorMessage);
    process.exit(1);
  }
} 
#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * This script validates that all required environment variables are set
 * before the build process starts.
 */

// Import required modules
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the required environment variables
const REQUIRED_ENV_VARS = [
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

// Validate the environment variables
function validateEnvVars() {
  const missingVars = [];
  
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  return missingVars;
}

// Main function
function main() {
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
  } else {
    console.log('\x1b[32m%s\x1b[0m', 'Environment validation passed: All required variables are set.');
  }
}

// Run the main function
main(); 
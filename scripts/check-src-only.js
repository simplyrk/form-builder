#!/usr/bin/env node

/**
 * Script to check only src files with ESLint
 * Run with: node scripts/check-src-only.js
 */

import { execSync } from 'child_process';

// Run ESLint only on src files
try {
  console.log('🔍 Running ESLint on src files only...');
  const command = 'npx eslint "src/**/*.{ts,tsx}" --max-warnings=0';
  execSync(command, { stdio: 'inherit' });
  console.log('✅ ESLint check passed!');
} catch (error) {
  console.error('❌ ESLint check failed!');
  process.exit(1);
} 
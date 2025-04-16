#!/usr/bin/env node

/**
 * Script to fix import order issues in the codebase using ESLint's autofix
 * Run with: node scripts/fix-imports.js
 * 
 * This script will:
 * 1. Run ESLint with --fix on specific directories one at a time
 * 2. Report progress and issues encountered
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Directories to process
const directories = [
  'src/components',
  'src/app',
  'src/lib',
  'src/utils',
  'src/types',
];

// Count of files processed and fixed
let totalProcessed = 0;
let totalFixed = 0;
let errorFiles = [];

console.log('🔍 Starting import order fixing script...');

// Process each directory
directories.forEach(directory => {
  try {
    console.log(`\n📁 Processing directory: ${directory}`);
    
    // Get list of files in the directory
    const files = getFilesRecursively(directory)
      .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
    
    if (files.length === 0) {
      console.log(`  No TypeScript files found in ${directory}`);
      return;
    }
    
    console.log(`  Found ${files.length} files to process`);
    
    // Process files in smaller batches to avoid command line length issues
    const batchSize = 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      processBatch(batch);
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${directory}:`, error.message);
  }
});

console.log('\n✅ Import fixing completed!');
console.log(`📊 Summary: Processed ${totalProcessed} files, fixed ${totalFixed} files`);

if (errorFiles.length > 0) {
  console.log(`\n⚠️ ${errorFiles.length} files had errors during processing:`);
  errorFiles.forEach(file => console.log(`  - ${file}`));
}

/**
 * Process a batch of files with ESLint --fix
 */
function processBatch(files) {
  totalProcessed += files.length;
  
  try {
    // Run ESLint with --fix on the batch of files
    const filePaths = files.join(' ');
    const command = `npx eslint ${filePaths} --fix --quiet --rule 'import/order: warn'`;
    
    execSync(command, { stdio: 'pipe' });
    
    // Count as fixed if no error
    totalFixed += files.length;
    process.stdout.write('.');
  } catch (error) {
    // Some files might have been fixed despite errors
    process.stdout.write('x');
    
    // Add files to error list
    files.forEach(file => errorFiles.push(file));
  }
}

/**
 * Get all files in a directory recursively
 */
function getFilesRecursively(directory) {
  let files = [];
  
  if (!fs.existsSync(directory)) {
    console.warn(`  Directory ${directory} does not exist`);
    return files;
  }
  
  const dirEntries = fs.readdirSync(directory, { withFileTypes: true });
  
  dirEntries.forEach(entry => {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules, .git, and other special directories
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files = files.concat(getFilesRecursively(fullPath));
      }
    } else {
      files.push(fullPath);
    }
  });
  
  return files;
} 
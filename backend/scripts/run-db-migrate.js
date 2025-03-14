#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 Database Migration Runner 🔧');

// Get command line arguments (remove node and script name)
const args = process.argv.slice(2);
console.log(`Arguments: ${args.join(' ')}`);

// Ensure the dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(distDir, { recursive: true });
}

// Ensure the scripts directory exists
const scriptsDir = path.join(distDir, 'scripts');
if (!fs.existsSync(scriptsDir)) {
  console.log('Creating scripts directory...');
  fs.mkdirSync(scriptsDir, { recursive: true });
}

try {
  // Compile the TypeScript file
  console.log('Compiling TypeScript migration script...');
  execSync('npx tsc src/scripts/dbmigrate.ts --outDir dist/scripts --esModuleInterop', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });

  // Run the compiled JS file with arguments
  console.log('Running database migration...');
  execSync(`node dist/scripts/dbmigrate.js ${args.join(' ')}`, {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });

  console.log('✅ Database migration completed successfully!');
} catch (error) {
  console.error('❌ Error running database migration:', error.message);
  process.exit(1);
} 
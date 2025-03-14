#!/usr/bin/env node

/**
 * This script provides instructions for setting up a cloud PostgreSQL database 
 * with Neon.tech and configuring it for the JobJedi application.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('');
console.log('===================================================');
console.log('   Setting up Cloud PostgreSQL for JobJedi');
console.log('===================================================');
console.log('');
console.log('This script will guide you through setting up a cloud PostgreSQL database with Neon.tech');
console.log('');
console.log('Steps:');
console.log('1. Sign up for a free account at https://neon.tech');
console.log('2. Create a new project in the Neon dashboard');
console.log('3. Get your connection string from the Neon dashboard');
console.log('4. Enter the connection string when prompted by this script');
console.log('');

const askForConnectionString = () => {
  rl.question('Enter your Neon PostgreSQL connection string (postgres://...): ', (connectionString) => {
    if (!connectionString.startsWith('postgres://')) {
      console.log('Error: Connection string should start with "postgres://"');
      return askForConnectionString();
    }

    try {
      // Create or update .env file
      const envPath = path.join(__dirname, '..', '.env');
      let envContent = '';

      // Read existing .env if it exists
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        
        // Check if DATABASE_URL already exists
        if (envContent.includes('DATABASE_URL=')) {
          // Replace existing DATABASE_URL
          envContent = envContent.replace(
            /DATABASE_URL=.*/,
            `DATABASE_URL=${connectionString}`
          );
        } else {
          // Add DATABASE_URL if it doesn't exist
          envContent += `\n# Cloud PostgreSQL Connection\nDATABASE_URL=${connectionString}\n`;
        }
      } else {
        // Create new .env file
        envContent = `# Cloud PostgreSQL Connection\nDATABASE_URL=${connectionString}\n`;
      }

      // Write to .env file
      fs.writeFileSync(envPath, envContent);
      
      console.log('');
      console.log('✅ Connection string successfully saved to .env file!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Run "npm run build" to build the TypeScript files');
      console.log('2. Run "npm start" to start the server with your cloud database');
      console.log('');
      
      rl.close();
    } catch (error) {
      console.error('Error updating .env file:', error);
      rl.close();
    }
  });
};

askForConnectionString(); 
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import os from 'os';

// Load environment variables
dotenv.config();

async function migrateDatabase() {
  console.log('🚀 Starting database migration...');
  
  // Determine which database to use from command line args
  const useLocal = process.argv.includes('--local');
  const useCloud = process.argv.includes('--cloud');
  
  // Get connection configuration
  const databaseUrl = process.env.DATABASE_URL;
  let pool: Pool;
  
  if (useCloud || (!useLocal && databaseUrl)) {
    if (!databaseUrl) {
      console.error('❌ Cloud database selected, but DATABASE_URL is not set in .env file');
      console.error('Please provide a DATABASE_URL environment variable or use --local flag');
      process.exit(1);
    }
    
    console.log('📡 Using cloud PostgreSQL database connection');
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  } else {
    // Local database configuration
    const systemUsername = os.userInfo().username;
    const user = process.env.POSTGRES_USER || systemUsername;
    const password = process.env.POSTGRES_PASSWORD || '';
    const host = process.env.POSTGRES_HOST || 'localhost';
    const database = process.env.POSTGRES_DB || 'jobjedi';
    const port = parseInt(process.env.POSTGRES_PORT || '5432');
    
    console.log('💻 Using local PostgreSQL database connection');
    console.log(`Database: ${database}, Host: ${host}, User: ${user}, Port: ${port}`);
    
    pool = new Pool({
      user,
      host,
      database,
      password,
      port,
      // Important: Do not use SSL for local connections
      ssl: false,
    });
  }
  
  try {
    // Test database connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release();
    
    // Get migration files
    const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');
    console.log(`📁 Reading migrations from: ${migrationsDir}`);
    
    try {
      // Check if directory exists
      if (!fs.existsSync(migrationsDir)) {
        console.error(`❌ Migrations directory does not exist: ${migrationsDir}`);
        throw new Error('Migrations directory not found');
      }
      
      // Get all SQL files from the migrations directory
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Sort to ensure consistent order of execution
      
      if (migrationFiles.length === 0) {
        console.error('❌ No migration files found');
        throw new Error('No migration files found');
      }
      
      console.log(`📋 Found ${migrationFiles.length} migration files: ${migrationFiles.join(', ')}`);
      
      // Execute each migration file
      for (const file of migrationFiles) {
        const filePath = path.join(migrationsDir, file);
        console.log(`🔄 Executing migration: ${file}`);
        
        const sql = fs.readFileSync(filePath, 'utf8');
        await pool.query(sql);
        
        console.log(`✅ Successfully executed migration: ${file}`);
      }
      
      console.log('🎉 All migrations completed successfully!');
    } catch (err) {
      console.error('❌ Error during migration:', err);
      throw err;
    }
  } catch (err) {
    console.error('❌ Database connection or migration error:', err);
    
    // Display helpful error message
    console.error('\n📋 Troubleshooting tips:');
    console.error('  1. Make sure PostgreSQL is running');
    console.error('  2. Verify your database credentials in .env file');
    console.error('  3. For local database, try running:');
    console.error('     - createdb jobjedi');
    console.error('  4. For cloud database, check your DATABASE_URL');
    console.error('  5. You can run with explicit flags:');
    console.error('     - npm run dbmigrate -- --local  (for local database)');
    console.error('     - npm run dbmigrate -- --cloud  (for cloud database)');
    
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Execute the migration function
migrateDatabase().catch(err => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
}); 
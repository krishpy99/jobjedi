import "reflect-metadata";
import { AppDataSource } from './data-source';

// Function to initialize the database and run migrations
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Starting database initialization with TypeORM...');
    
    // Initialize the data source
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('TypeORM Data Source has been initialized');
    }
    
    // Run migrations if needed
    await AppDataSource.runMigrations();
    console.log('Database migrations completed successfully');
    
    console.log('Database initialization completed successfully');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error initializing database:', errorMessage);
    
    // We'll rethrow but log a more helpful message first
    console.error('Please check that:');
    console.error('1. Your PostgreSQL database is running');
    console.error('2. The database "jobjedi" exists');
    console.error('3. Your database credentials are correct in .env file');
    console.error('4. You have permissions to create tables in the database');
    
    throw error;
  }
} 
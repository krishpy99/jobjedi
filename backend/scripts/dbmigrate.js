#!/usr/bin/env node

/**
 * Database migration script for JobJedi
 * This script uses TypeORM to manage database migrations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for pretty console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to print colored messages
function print(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Helper function to run shell commands and handle errors
function runCommand(command, errorMessage) {
  try {
    return execSync(command, { stdio: 'inherit' });
  } catch (error) {
    print(`\n${errorMessage}`, colors.red);
    print(`Command failed: ${command}`, colors.yellow);
    print(`Error: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Main migration function
async function runMigration() {
  print('\n🔄 JobJedi Database Migration Tool (TypeORM) 🔄\n', colors.bright + colors.cyan);
  
  // Get command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'run';
  
  // Check if TypeORM and its CLI are installed
  const typeormBin = path.join(__dirname, '..', 'node_modules', '.bin', 'typeorm');
  
  if (!fs.existsSync(typeormBin)) {
    print('TypeORM not found. Installing required dependencies...', colors.yellow);
    runCommand(
      'npm install typeorm @types/node pg reflect-metadata --save',
      'Failed to install TypeORM dependencies'
    );
  }
  
  // Ensure the database config directory exists
  const dbConfigDir = path.join(__dirname, '..', 'src', 'db');
  if (!fs.existsSync(dbConfigDir)) {
    print('Creating database configuration directory...', colors.blue);
    fs.mkdirSync(dbConfigDir, { recursive: true });
  }
  
  // Ensure the migration directory exists
  const migrationsDir = path.join(__dirname, '..', 'src', 'db', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    print('Creating migrations directory...', colors.blue);
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  // Ensure the entity directory exists
  const entitiesDir = path.join(__dirname, '..', 'src', 'db', 'entities');
  if (!fs.existsSync(entitiesDir)) {
    print('Creating entities directory...', colors.blue);
    fs.mkdirSync(entitiesDir, { recursive: true });
  }
  
  // Check if data source config exists, if not create it
  const dataSourcePath = path.join(dbConfigDir, 'data-source.ts');
  if (!fs.existsSync(dataSourcePath)) {
    print('Creating TypeORM data source configuration...', colors.blue);
    
    const dataSourceContent = `import "reflect-metadata";
import { DataSource } from "typeorm";
import { Job } from "./entities/Job";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Check if we're using a cloud database URL or local configuration
const databaseUrl = process.env.DATABASE_URL;
let connectionOptions;

if (databaseUrl) {
  // Parse the connection URL
  const url = new URL(databaseUrl);
  
  connectionOptions = {
    type: "postgres",
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    username: url.username,
    password: url.password,
    database: url.pathname.substring(1), // Remove leading '/'
    ssl: {
      rejectUnauthorized: false, // Required for some cloud providers
    }
  };
} else {
  // Use local configuration from .env
  connectionOptions = {
    type: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    username: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    database: process.env.POSTGRES_DB || "jobjedi",
    ssl: process.env.POSTGRES_SSL === "true",
  };
}

export const AppDataSource = new DataSource({
  ...connectionOptions,
  type: "postgres",
  synchronize: false, // Set to false in production
  logging: process.env.NODE_ENV !== "production",
  entities: [Job],
  migrations: ["src/db/migrations/*.ts"],
  subscribers: [],
});
`;
    
    fs.writeFileSync(dataSourcePath, dataSourceContent);
    print('Created TypeORM data source configuration', colors.green);
  }
  
  // Create Job entity if it doesn't exist
  const jobEntityPath = path.join(entitiesDir, 'Job.ts');
  if (!fs.existsSync(jobEntityPath)) {
    print('Creating Job entity...', colors.blue);
    
    const jobEntityContent = `import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

@Entity({ name: "jobs" })
export class Job {
  @PrimaryColumn()
  userEmail: string;

  @PrimaryColumn()
  jobUrl: string;

  @Column({ nullable: true })
  @Index()
  companyName: string | null;

  @Column({ nullable: true })
  @Index()
  position: string | null;

  @Column({ type: "text", nullable: true })
  jobDescription: string | null;

  @Column("float", { array: true, nullable: true })
  embeddings: number[] | null;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
`;
    
    fs.writeFileSync(jobEntityPath, jobEntityContent);
    print('Created Job entity', colors.green);
  }
  
  // Check if .env exists and has necessary variables
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    print('Creating .env file with database configuration...', colors.blue);
    
    const defaultEnv = `# Database Configuration
# For cloud database, use DATABASE_URL
# DATABASE_URL="postgres://username:password@host:port/database"

# For local development:
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=jobjedi
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_SSL=false

# Other environment variables
NODE_ENV=development
`;
    
    fs.writeFileSync(envPath, defaultEnv);
    print('Created .env file with database configuration', colors.yellow);
    print('⚠️ Please update the database credentials in .env with your actual values', colors.bright + colors.yellow);
  }
  
  // Create a TypeORM config file for CLI
  const typeormConfigPath = path.join(__dirname, '..', 'typeorm.config.js');
  if (!fs.existsSync(typeormConfigPath)) {
    print('Creating TypeORM config file for CLI...', colors.blue);
    
    const typeormConfigContent = `require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
let config;

if (databaseUrl) {
  // Parse the connection URL
  const url = new URL(databaseUrl);
  
  config = {
    type: "postgres",
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    username: url.username,
    password: url.password,
    database: url.pathname.substring(1), // Remove leading '/'
    ssl: {
      rejectUnauthorized: false
    }
  };
} else {
  // Use local configuration from .env
  config = {
    type: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    username: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    database: process.env.POSTGRES_DB || "jobjedi",
    ssl: process.env.POSTGRES_SSL === "true"
  };
}

module.exports = {
  ...config,
  synchronize: false,
  logging: process.env.NODE_ENV !== "production",
  entities: ["src/db/entities/**/*.ts"],
  migrations: ["src/db/migrations/**/*.ts"],
  subscribers: ["src/db/subscribers/**/*.ts"],
  cli: {
    entitiesDir: "src/db/entities",
    migrationsDir: "src/db/migrations",
    subscribersDir: "src/db/subscribers"
  }
};
`;
    
    fs.writeFileSync(typeormConfigPath, typeormConfigContent);
    print('Created TypeORM config file for CLI', colors.green);
  }
  
  // Handle different migration commands
  switch (command) {
    case 'create':
      const migrationName = args[1];
      if (!migrationName) {
        print('Migration name is required for create command', colors.red);
        print('Usage: npm run db:create <migration-name>', colors.yellow);
        process.exit(1);
      }
      
      print(`Creating migration ${migrationName}...`, colors.blue);
      runCommand(
        `npx typeorm-ts-node-commonjs migration:create src/db/migrations/${migrationName}`,
        'Failed to create migration'
      );
      break;
    
    case 'generate':
      const genName = args[1] || 'GeneratedMigration';
      print(`Generating migration ${genName}...`, colors.blue);
      runCommand(
        `npx typeorm-ts-node-commonjs migration:generate -d ./src/db/data-source.ts src/db/migrations/${genName}`,
        'Failed to generate migration'
      );
      break;
    
    case 'run':
      print('Running migrations...', colors.blue);
      runCommand(
        'npx typeorm-ts-node-commonjs migration:run -d ./src/db/data-source.ts',
        'Failed to run migrations'
      );
      break;
    
    case 'revert':
      print('Reverting last migration...', colors.blue);
      runCommand(
        'npx typeorm-ts-node-commonjs migration:revert -d ./src/db/data-source.ts',
        'Failed to revert migration'
      );
      break;
    
    case 'show':
      print('Showing migration status...', colors.blue);
      runCommand(
        'npx typeorm-ts-node-commonjs migration:show -d ./src/db/data-source.ts',
        'Failed to show migration status'
      );
      break;
    
    case 'init':
      // Create initial migration
      print('Creating initial migration...', colors.blue);
      
      // Create an initial migration file
      const initialMigrationPath = path.join(migrationsDir, 'InitialMigration.ts');
      if (!fs.existsSync(initialMigrationPath)) {
        const initialMigrationContent = `import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class InitialMigration1624432423000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "jobs",
                columns: [
                    {
                        name: "userEmail",
                        type: "varchar",
                        isNullable: false,
                        isPrimary: true
                    },
                    {
                        name: "jobUrl",
                        type: "varchar",
                        isNullable: false,
                        isPrimary: true
                    },
                    {
                        name: "companyName",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "position",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "jobDescription",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "embeddings",
                        type: "float",
                        isArray: true,
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
                indices: [
                    {
                        name: "IDX_COMPANY_NAME",
                        columnNames: ["companyName"]
                    },
                    {
                        name: "IDX_POSITION",
                        columnNames: ["position"]
                    },
                    {
                        name: "IDX_CREATED_AT",
                        columnNames: ["createdAt"]
                    }
                ]
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("jobs");
    }
}
`;
        
        fs.writeFileSync(initialMigrationPath, initialMigrationContent);
        print('Created initial migration file', colors.green);
      }
      
      // Run the migration
      print('Running initial migration...', colors.blue);
      runCommand(
        'npx typeorm-ts-node-commonjs migration:run -d ./src/db/data-source.ts',
        'Failed to run initial migration'
      );
      break;
    
    default:
      print('Unknown command: ' + command, colors.red);
      print('\nAvailable commands:', colors.bright);
      print('  init     - Create and run initial migration', colors.cyan);
      print('  create   - Create a new empty migration', colors.cyan);
      print('  generate - Generate a new migration based on entity changes', colors.cyan);
      print('  run      - Run pending migrations', colors.cyan);
      print('  revert   - Revert the last executed migration', colors.cyan);
      print('  show     - Show executed migrations', colors.cyan);
      process.exit(1);
  }
  
  print('\n✅ Database migration command completed successfully!', colors.bright + colors.green);
}

// Run the migration
runMigration().catch(error => {
  print(`\n❌ Fatal error: ${error.message}`, colors.bright + colors.red);
  process.exit(1);
}); 
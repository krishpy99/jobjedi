# JobJedi Backend

This is the backend service for the JobJedi application, providing API endpoints for job management.

## Database Management

### TypeORM Migrations

This project uses TypeORM's structured migrations approach to manage database schema changes. Migrations provide a way to incrementally update your database schema and apply changes in a safe, controlled manner while preserving data.

#### Key Migration Commands

- **Generate a migration**: Creates a migration file by comparing your entity models with the current database schema
  ```
  npm run migration:generate MeaningfulName
  ```

- **Create a manual migration**: Creates an empty migration file for manual implementation
  ```
  npm run migration:create CustomMigration
  ```

- **Run pending migrations**: Apply all pending migrations to the database
  ```
  npm run migration:run
  ```

- **Revert the last migration**: Undo the most recently applied migration
  ```
  npm run migration:revert
  ```

- **Show migration status**: See which migrations have been applied and which are pending
  ```
  npm run migration:show
  ```

#### Migration Best Practices

1. **Always include both up and down methods**: The up method applies changes, and the down method reverts them.

2. **Use transactions when appropriate**: For complex migrations, wrap operations in transactions.

3. **Keep migrations incremental**: Add or modify schema elements without removing data.

4. **Test migrations thoroughly**: Always test on a staging environment before production.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your database credentials.

3. Run database migrations:
   ```
   npm run migration:run
   ```

4. Start the development server:
   ```
   npm run dev
   ```

The server will start after applying any pending migrations to ensure your database schema is up to date. 
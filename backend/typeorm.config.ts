import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

// Define the data source for CLI usage
const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "jobjedi",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [path.join(__dirname, "src/db/entities", "*.{ts,js}")],
  migrations: [path.join(__dirname, "src/db/migrations", "*.{ts,js}")],
  migrationsTableName: "migrations_typeorm",
  ssl: process.env.DB_SSL === "true"
});

// Export as default for CLI usage
export default dataSource; 
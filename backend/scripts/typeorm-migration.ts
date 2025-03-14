import "reflect-metadata";
import { AppDataSource } from "../src/db/data-source";

// Initialize the data source
AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source has been initialized");
    
    // Run migrations
    const migrations = await AppDataSource.runMigrations();
    console.log(`Executed ${migrations.length} migrations`);
    
    // Close the connection
    await AppDataSource.destroy();
    console.log("Data Source has been closed");
    
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
    process.exit(1);
  }); 
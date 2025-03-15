import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class InitialMigration1710000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the jobs table
        await queryRunner.createTable(
            new Table({
                name: "jobs",
                columns: [
                    {
                        name: "userEmail",
                        type: "varchar",
                        isPrimary: true,
                        isNullable: false,
                    },
                    {
                        name: "jobUrl",
                        type: "varchar",
                        isPrimary: true,
                        isNullable: false,
                    },
                    {
                        name: "companyName",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "position",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "jobDescription",
                        type: "text",
                        isNullable: false,
                    },
                    {
                        name: "pineconeId",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        // Create an index on userEmail for faster user-specific queries
        await queryRunner.createIndex(
            "jobs",
            new TableIndex({
                name: "IDX_JOBS_USER_EMAIL",
                columnNames: ["userEmail"],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the index first
        await queryRunner.dropIndex("jobs", "IDX_JOBS_USER_EMAIL");
        
        // Drop the table
        await queryRunner.dropTable("jobs");
    }
} 
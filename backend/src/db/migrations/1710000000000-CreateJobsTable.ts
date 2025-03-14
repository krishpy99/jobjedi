import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateJobsTable1710000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "jobs",
                columns: [
                    {
                        name: "user_email",
                        type: "varchar",
                        isPrimary: true,
                        isNullable: false,
                    },
                    {
                        name: "job_url",
                        type: "varchar",
                        isPrimary: true,
                        isNullable: false,
                    },
                    {
                        name: "company_name",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "position",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "job_description",
                        type: "text",
                        isNullable: false,
                    },
                    {
                        name: "embeddings",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );

        // Create a full-text search index
        await queryRunner.query(`
            ALTER TABLE jobs ADD COLUMN ts_search_vector tsvector 
            GENERATED ALWAYS AS (
                setweight(to_tsvector('english', coalesce(company_name, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(position, '')), 'B') ||
                setweight(to_tsvector('english', coalesce(job_description, '')), 'C')
            ) STORED;
        `);

        await queryRunner.createIndex(
            "jobs",
            new TableIndex({
                name: "idx_jobs_search",
                columnNames: ["ts_search_vector"],
                isUnique: false,
                isFulltext: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("jobs", "idx_jobs_search");
        await queryRunner.dropTable("jobs");
    }
} 
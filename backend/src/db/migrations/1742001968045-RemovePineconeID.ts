import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePineconeID1742001968045 implements MigrationInterface {
    name = 'RemovePineconeID1742001968045'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_JOBS_USER_EMAIL"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "pineconeId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" ADD "pineconeId" character varying`);
        await queryRunner.query(`CREATE INDEX "IDX_JOBS_USER_EMAIL" ON "jobs" ("userEmail") `);
    }

}

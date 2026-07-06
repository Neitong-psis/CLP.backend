import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCourseMetaFields1781200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "courses"
        ADD COLUMN IF NOT EXISTS "slug"     character varying(255),
        ADD COLUMN IF NOT EXISTS "subtitle" character varying(255),
        ADD COLUMN IF NOT EXISTS "level"    character varying(50),
        ADD COLUMN IF NOT EXISTS "duration" character varying(100),
        ADD COLUMN IF NOT EXISTS "tags"     jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "courses"
        DROP COLUMN IF EXISTS "slug",
        DROP COLUMN IF EXISTS "subtitle",
        DROP COLUMN IF EXISTS "level",
        DROP COLUMN IF EXISTS "duration",
        DROP COLUMN IF EXISTS "tags"
    `);
  }
}

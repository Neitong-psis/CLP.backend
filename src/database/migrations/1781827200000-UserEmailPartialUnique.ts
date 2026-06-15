import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserEmailPartialUnique1781827200000 implements MigrationInterface {
  name = 'UserEmailPartialUnique1781827200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the plain column-level unique constraint (auto-named "user_email_key"),
    // which counts soft-deleted rows and blocks re-registration of freed emails.
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_email_key"`,
    );
    // Replace it with a partial unique index that only applies to live rows,
    // so a soft-deleted user's email becomes available again.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_user_email_active" ON "user" ("email") WHERE "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_user_email_active"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "user_email_key" UNIQUE ("email")`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCourseStatusAndReviewsTable1781196030182 implements MigrationInterface {
  name = 'AddCourseStatusAndReviewsTable1781196030182';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── Drop old indexes ────────────────────────────────────────────────────
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_session_userId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_courses_instructor"`,
    );

    // ─── Create course_reviews table ─────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "course_reviews" ("review_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying(50) NOT NULL, "feedback" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "course_id" uuid NOT NULL, "reviewer_id" uuid NOT NULL, CONSTRAINT "PK_989023fc39038df1efe31c373a8" PRIMARY KEY ("review_id"))`,
    );

    // ─── Add primary key to user_role_assignments ───────────────────────────
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" ADD CONSTRAINT "PK_d840445bb72ff3e0a09d464c1a5" PRIMARY KEY ("user_id", "role_id")`,
    );

    // ─── Create course status enum type ──────────────────────────────────────
    await queryRunner.query(
      `CREATE TYPE "public"."courses_status_enum" AS ENUM('todo', 'in_writing', 'under_review', 'published', 'archived')`,
    );

    // ─── Add status column to courses ────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "courses" ADD COLUMN "status" "public"."courses_status_enum" NOT NULL DEFAULT 'todo'`,
    );

    // ─── Migrate is_published to status ──────────────────────────────────────
    await queryRunner.query(
      `UPDATE "courses" SET "status" = 'published' WHERE "is_published" = true`,
    );

    // ─── Drop old is_published column ────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "is_published"`);

    // ─── Create session index ────────────────────────────────────────────────
    await queryRunner.query(
      `CREATE INDEX "IDX_3d2f174ef04fb312fdebd0ddc5" ON "session" ("userId") `,
    );

    // ─── Create indexes on course_reviews ────────────────────────────────────
    await queryRunner.query(
      `CREATE INDEX "IDX_course_reviews_course_id" ON "course_reviews" ("course_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_course_reviews_reviewer_id" ON "course_reviews" ("reviewer_id")`,
    );

    // ─── Add foreign key constraints ─────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "course_reviews" ADD CONSTRAINT "FK_1f69fdcbd7ea5f0e52c3230c00b" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_reviews" ADD CONSTRAINT "FK_0e8d075087cb5408c0e9578d87e" FOREIGN KEY ("reviewer_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ─── Drop foreign key constraints ────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "course_reviews" DROP CONSTRAINT "FK_0e8d075087cb5408c0e9578d87e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_reviews" DROP CONSTRAINT "FK_1f69fdcbd7ea5f0e52c3230c00b"`,
    );

    // ─── Drop indexes ────────────────────────────────────────────────────────
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_course_reviews_reviewer_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_course_reviews_course_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_3d2f174ef04fb312fdebd0ddc5"`,
    );

    // ─── Re-add is_published column ──────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "courses" ADD COLUMN "is_published" boolean NOT NULL DEFAULT false`,
    );

    // ─── Migrate status back to is_published ──────────────────────────────────
    await queryRunner.query(
      `UPDATE "courses" SET "is_published" = true WHERE "status" = 'published'`,
    );

    // ─── Drop status column ──────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "status"`);

    // ─── Drop course status enum type ────────────────────────────────────────
    await queryRunner.query(`DROP TYPE "public"."courses_status_enum"`);

    // ─── Drop user_role_assignments primary key ──────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP CONSTRAINT "PK_d840445bb72ff3e0a09d464c1a5"`,
    );

    // ─── Drop course_reviews table ───────────────────────────────────────────
    await queryRunner.query(`DROP TABLE "course_reviews"`);

    // ─── Recreate old indexes ────────────────────────────────────────────────
    await queryRunner.query(
      `CREATE INDEX "IDX_courses_instructor" ON "courses" ("instructor_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_session_userId" ON "session" ("userId") `,
    );
  }
}

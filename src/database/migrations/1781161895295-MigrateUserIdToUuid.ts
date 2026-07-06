import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateUserIdToUuid1781161895295 implements MigrationInterface {
  name = 'MigrateUserIdToUuid1781161895295';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── Enable uuid-ossp extension ──────────────────────────────────────────
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ─── Drop all referencing foreign key constraints ────────────────────────
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "FK_3d2f174ef04fb312fdebd0ddc53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "FK_4fdc83dd6b261101401ec259342"`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "FK_courses_instructor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP CONSTRAINT IF EXISTS "FK_03eb0e6d5ebfdb266edecb67c7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP CONSTRAINT IF EXISTS "FK_user_role_assignments_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP CONSTRAINT IF EXISTS "FK_ura_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_ratings" DROP CONSTRAINT IF EXISTS "FK_course_ratings_student"`,
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "FK_enrollments_student"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_progress" DROP CONSTRAINT IF EXISTS "FK_lesson_progress_student"`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussions" DROP CONSTRAINT IF EXISTS "FK_discussions_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussion_replies" DROP CONSTRAINT IF EXISTS "FK_discussion_replies_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" DROP CONSTRAINT IF EXISTS "FK_quiz_attempts_student"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" DROP CONSTRAINT IF EXISTS "FK_submissions_student"`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" DROP CONSTRAINT IF EXISTS "FK_certificates_student"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_journey_data" DROP CONSTRAINT IF EXISTS "FK_student_journey_data_student"`,
    );

    // ─── Drop primary key constraint of user ─────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "PK_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "PK_cace4a159ff9f2512dd42373760"`,
    );

    // ─── Add temporary UUID column to user and copy/generate values ──────────
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN "new_id" uuid DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `UPDATE "user" SET "new_id" = uuid_generate_v4() WHERE "new_id" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "new_id" SET NOT NULL`,
    );

    // ─── Add temporary UUID columns to referencing tables ────────────────────
    await queryRunner.query(
      `ALTER TABLE "session" ADD COLUMN "new_userId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD COLUMN "new_instructor_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" ADD COLUMN "new_user_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_ratings" ADD COLUMN "new_student_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" ADD COLUMN "new_student_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_progress" ADD COLUMN "new_student_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussions" ADD COLUMN "new_user_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussion_replies" ADD COLUMN "new_user_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD COLUMN "new_student_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" ADD COLUMN "new_student_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" ADD COLUMN "new_student_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_journey_data" ADD COLUMN "new_student_id" uuid`,
    );

    // ─── Populate temporary UUID columns by mapping with old integer IDs ─────
    await queryRunner.query(
      `UPDATE "session" s SET "new_userId" = u."new_id" FROM "user" u WHERE s."userId" = u."id"`,
    );
    await queryRunner.query(
      `UPDATE "courses" c SET "new_instructor_id" = u."new_id" FROM "user" u WHERE c."instructor_id" = u."id"`,
    );
    await queryRunner.query(
      `UPDATE "user_role_assignments" ura SET "new_user_id" = u."new_id" FROM "user" u WHERE ura."user_id" = u."id"`,
    );
    await queryRunner.query(
      `UPDATE "course_ratings" cr SET "new_student_id" = u."new_id" FROM "user" u WHERE cr."student_id" = u."id"`,
    );
    await queryRunner.query(
      `UPDATE "enrollments" e SET "new_student_id" = u."new_id" FROM "user" u WHERE e."student_id" = u."id"`,
    );
    await queryRunner.query(
      `UPDATE "lesson_progress" lp SET "new_student_id" = u."new_id" FROM "user" u WHERE lp."student_id" = u."id"`,
    );
    await queryRunner.query(
      `UPDATE "discussions" d SET "new_user_id" = u."new_id" FROM "user" u WHERE d."user_id" = u."id"`,
    );
    await queryRunner.query(
      `UPDATE "discussion_replies" dr SET "new_user_id" = u."new_id" FROM "user" u WHERE dr."user_id" = u."id"`,
    );
    await queryRunner.query(
      `UPDATE "quiz_attempts" qa SET "new_student_id" = u."new_id" FROM "user" u WHERE qa."student_id" = u."id"`,
    );
    await queryRunner.query(
      `UPDATE "submissions" s SET "new_student_id" = u."new_id" FROM "user" u WHERE s."student_id" = u."id"`,
    );
    await queryRunner.query(
      `UPDATE "certificates" c SET "new_student_id" = u."new_id" FROM "user" u WHERE c."student_id" = u."id"`,
    );
    await queryRunner.query(
      `UPDATE "student_journey_data" sjd SET "new_student_id" = u."new_id" FROM "user" u WHERE sjd."student_id" = u."id"`,
    );

    // ─── Enforce NOT NULL constraints on columns that were originally NOT NULL
    await queryRunner.query(
      `ALTER TABLE "courses" ALTER COLUMN "new_instructor_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" ALTER COLUMN "new_user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_ratings" ALTER COLUMN "new_student_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" ALTER COLUMN "new_student_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_progress" ALTER COLUMN "new_student_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussions" ALTER COLUMN "new_user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussion_replies" ALTER COLUMN "new_user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ALTER COLUMN "new_student_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" ALTER COLUMN "new_student_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" ALTER COLUMN "new_student_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_journey_data" ALTER COLUMN "new_student_id" SET NOT NULL`,
    );

    // ─── Drop old indices ────────────────────────────────────────────────────
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_3d2f174ef04fb312fdebd0ddc5"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_03eb0e6d5ebfdb266edecb67c7"`,
    );

    // ─── Drop old integer columns ────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "courses" DROP COLUMN "instructor_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP COLUMN "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_ratings" DROP COLUMN "student_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" DROP COLUMN "student_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_progress" DROP COLUMN "student_id"`,
    );
    await queryRunner.query(`ALTER TABLE "discussions" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "discussion_replies" DROP COLUMN "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" DROP COLUMN "student_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" DROP COLUMN "student_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" DROP COLUMN "student_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_journey_data" DROP COLUMN "student_id"`,
    );

    // ─── Rename temporary columns to original names ──────────────────────────
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "new_id" TO "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" RENAME COLUMN "new_userId" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" RENAME COLUMN "new_instructor_id" TO "instructor_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" RENAME COLUMN "new_user_id" TO "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_ratings" RENAME COLUMN "new_student_id" TO "student_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" RENAME COLUMN "new_student_id" TO "student_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_progress" RENAME COLUMN "new_student_id" TO "student_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussions" RENAME COLUMN "new_user_id" TO "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussion_replies" RENAME COLUMN "new_user_id" TO "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" RENAME COLUMN "new_student_id" TO "student_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" RENAME COLUMN "new_student_id" TO "student_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" RENAME COLUMN "new_student_id" TO "student_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_journey_data" RENAME COLUMN "new_student_id" TO "student_id"`,
    );

    // ─── Recreate primary key constraints ────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_user" PRIMARY KEY ("id")`,
    );

    // ─── Recreate foreign key constraints ────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD CONSTRAINT "FK_4fdc83dd6b261101401ec259342" FOREIGN KEY ("instructor_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" ADD CONSTRAINT "FK_03eb0e6d5ebfdb266edecb67c7a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_ratings" ADD CONSTRAINT "FK_course_ratings_student" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" ADD CONSTRAINT "FK_enrollments_student" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_progress" ADD CONSTRAINT "FK_lesson_progress_student" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussions" ADD CONSTRAINT "FK_discussions_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussion_replies" ADD CONSTRAINT "FK_discussion_replies_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_quiz_attempts_student" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" ADD CONSTRAINT "FK_submissions_student" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" ADD CONSTRAINT "FK_certificates_student" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_journey_data" ADD CONSTRAINT "FK_student_journey_data_student" FOREIGN KEY ("student_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // ─── Recreate indices ────────────────────────────────────────────────────
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_session_userId" ON "session" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_courses_instructor" ON "courses" ("instructor_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_enrollments_student" ON "enrollments" ("student_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_lesson_progress_student" ON "lesson_progress" ("student_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_quiz_attempts_student" ON "quiz_attempts" ("student_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_submissions_student" ON "submissions" ("student_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_03eb0e6d5ebfdb266edecb67c7" ON "user_role_assignments" ("user_id")`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public down(queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      'Down migration for UUID conversion is not supported as it could result in loss of UUID mapping uniqueness.',
    );
  }
}

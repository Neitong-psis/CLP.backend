import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCLPSchema1748361600000 implements MigrationInterface {
  name = 'CreateCLPSchema1748361600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── user_roles ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "role_id"     uuid NOT NULL DEFAULT uuid_generate_v4(),
        "role_name"   character varying(100) NOT NULL,
        "description" text,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("role_id")
      )
    `);

    // ─── course_categories (self-referencing) ─────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "course_categories" (
        "category_id"        uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name"               character varying(255) NOT NULL,
        "slug"               character varying(255) NOT NULL,
        "description"        text,
        "thumbnail"          character varying(500),
        "parent_category_id" uuid,
        "path"               character varying(500),
        "sort_order"         integer NOT NULL DEFAULT 0,
        "is_active"          boolean NOT NULL DEFAULT true,
        "created_at"         TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_course_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_course_categories" PRIMARY KEY ("category_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "course_categories"
        ADD CONSTRAINT "FK_course_categories_parent"
        FOREIGN KEY ("parent_category_id")
        REFERENCES "course_categories"("category_id")
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // ─── courses ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "courses" (
        "course_id"     uuid NOT NULL DEFAULT uuid_generate_v4(),
        "instructor_id" integer NOT NULL,
        "category_id"   uuid,
        "title"         character varying(255) NOT NULL,
        "description"   text,
        "price"         numeric(18,2) NOT NULL DEFAULT 0,
        "thumbnail"     character varying(500),
        "is_published"  boolean NOT NULL DEFAULT false,
        "meta"          jsonb,
        CONSTRAINT "PK_courses" PRIMARY KEY ("course_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "courses"
        ADD CONSTRAINT "FK_courses_instructor"
        FOREIGN KEY ("instructor_id")
        REFERENCES "user"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "courses"
        ADD CONSTRAINT "FK_courses_category"
        FOREIGN KEY ("category_id")
        REFERENCES "course_categories"("category_id")
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // ─── user_role_assignments ────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "user_role_assignments" (
        "assignment_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"       integer NOT NULL,
        "role_id"       uuid NOT NULL,
        "assigned_at"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_role_assignments" PRIMARY KEY ("assignment_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "user_role_assignments"
        ADD CONSTRAINT "FK_user_role_assignments_user"
        FOREIGN KEY ("user_id")
        REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "user_role_assignments"
        ADD CONSTRAINT "FK_user_role_assignments_role"
        FOREIGN KEY ("role_id")
        REFERENCES "user_roles"("role_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── course_preview ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "course_preview" (
        "preview_id"       uuid NOT NULL DEFAULT uuid_generate_v4(),
        "course_id"        uuid NOT NULL,
        "preview_url"      character varying(500) NOT NULL,
        "is_active"        boolean NOT NULL DEFAULT true,
        "thumbnail"        character varying(500),
        "duration_seconds" integer NOT NULL DEFAULT 0,
        "order_index"      integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_course_preview" PRIMARY KEY ("preview_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "course_preview"
        ADD CONSTRAINT "FK_course_preview_course"
        FOREIGN KEY ("course_id")
        REFERENCES "courses"("course_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── course_ratings ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "course_ratings" (
        "rating_id"  uuid NOT NULL DEFAULT uuid_generate_v4(),
        "course_id"  uuid NOT NULL,
        "student_id" integer NOT NULL,
        "rating"     integer NOT NULL,
        "review"     text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_course_ratings" PRIMARY KEY ("rating_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "course_ratings"
        ADD CONSTRAINT "FK_course_ratings_course"
        FOREIGN KEY ("course_id")
        REFERENCES "courses"("course_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "course_ratings"
        ADD CONSTRAINT "FK_course_ratings_student"
        FOREIGN KEY ("student_id")
        REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── enrollments ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "enrollments" (
        "enrollment_id"       uuid NOT NULL DEFAULT uuid_generate_v4(),
        "course_id"           uuid NOT NULL,
        "student_id"          integer NOT NULL,
        "enrolled_at"         TIMESTAMP NOT NULL DEFAULT now(),
        "progress_percentage" numeric(5,2) NOT NULL DEFAULT 0,
        "status"              character varying(50) NOT NULL DEFAULT 'active',
        CONSTRAINT "PK_enrollments" PRIMARY KEY ("enrollment_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "enrollments"
        ADD CONSTRAINT "FK_enrollments_course"
        FOREIGN KEY ("course_id")
        REFERENCES "courses"("course_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "enrollments"
        ADD CONSTRAINT "FK_enrollments_student"
        FOREIGN KEY ("student_id")
        REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── modules ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "modules" (
        "module_id"    uuid NOT NULL DEFAULT uuid_generate_v4(),
        "course_id"    uuid NOT NULL,
        "title"        character varying(255) NOT NULL,
        "description"  text,
        "order_index"  integer NOT NULL DEFAULT 0,
        "is_published" boolean NOT NULL DEFAULT false,
        "created_at"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_modules" PRIMARY KEY ("module_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "modules"
        ADD CONSTRAINT "FK_modules_course"
        FOREIGN KEY ("course_id")
        REFERENCES "courses"("course_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── lessons ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "lessons" (
        "lesson_id"              uuid NOT NULL DEFAULT uuid_generate_v4(),
        "module_id"              uuid NOT NULL,
        "title"                  character varying(500) NOT NULL,
        "content_type"           character varying(100) NOT NULL,
        "content"                character varying(500),
        "video_duration_seconds" integer NOT NULL DEFAULT 0,
        "order_index"            integer NOT NULL DEFAULT 0,
        "is_free"                boolean NOT NULL DEFAULT false,
        "created_at"             TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lessons" PRIMARY KEY ("lesson_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "lessons"
        ADD CONSTRAINT "FK_lessons_module"
        FOREIGN KEY ("module_id")
        REFERENCES "modules"("module_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── lesson_progress ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "lesson_progress" (
        "progress_id"             uuid NOT NULL DEFAULT uuid_generate_v4(),
        "lesson_id"               uuid NOT NULL,
        "student_id"              integer NOT NULL,
        "watched_duration_seconds" integer NOT NULL DEFAULT 0,
        "percentage_watched"      numeric(5,2) NOT NULL DEFAULT 0,
        "last_watched_at"         TIMESTAMP NOT NULL DEFAULT now(),
        "is_completed"            boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_lesson_progress" PRIMARY KEY ("progress_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "lesson_progress"
        ADD CONSTRAINT "FK_lesson_progress_lesson"
        FOREIGN KEY ("lesson_id")
        REFERENCES "lessons"("lesson_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "lesson_progress"
        ADD CONSTRAINT "FK_lesson_progress_student"
        FOREIGN KEY ("student_id")
        REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── discussions ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "discussions" (
        "discussion_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "course_id"     uuid NOT NULL,
        "user_id"       integer NOT NULL,
        "category_id"   uuid,
        "title"         character varying(255) NOT NULL,
        "content"       text NOT NULL,
        "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_discussions" PRIMARY KEY ("discussion_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "discussions"
        ADD CONSTRAINT "FK_discussions_course"
        FOREIGN KEY ("course_id")
        REFERENCES "courses"("course_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "discussions"
        ADD CONSTRAINT "FK_discussions_user"
        FOREIGN KEY ("user_id")
        REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "discussions"
        ADD CONSTRAINT "FK_discussions_category"
        FOREIGN KEY ("category_id")
        REFERENCES "course_categories"("category_id")
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // ─── discussion_replies ───────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "discussion_replies" (
        "reply_id"      uuid NOT NULL DEFAULT uuid_generate_v4(),
        "discussion_id" uuid NOT NULL,
        "user_id"       integer NOT NULL,
        "content"       text NOT NULL,
        "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_discussion_replies" PRIMARY KEY ("reply_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "discussion_replies"
        ADD CONSTRAINT "FK_discussion_replies_discussion"
        FOREIGN KEY ("discussion_id")
        REFERENCES "discussions"("discussion_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "discussion_replies"
        ADD CONSTRAINT "FK_discussion_replies_user"
        FOREIGN KEY ("user_id")
        REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── quizzes ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "quizzes" (
        "quiz_id"            uuid NOT NULL DEFAULT uuid_generate_v4(),
        "lesson_id"          uuid NOT NULL,
        "title"              character varying(255) NOT NULL,
        "time_limit_minutes" integer,
        "passing_score"      numeric(5,2) NOT NULL DEFAULT 60,
        "created_at"         TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_quizzes" PRIMARY KEY ("quiz_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "quizzes"
        ADD CONSTRAINT "FK_quizzes_lesson"
        FOREIGN KEY ("lesson_id")
        REFERENCES "lessons"("lesson_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── quiz_attempts ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "quiz_attempts" (
        "attempt_id"   uuid NOT NULL DEFAULT uuid_generate_v4(),
        "quiz_id"      uuid NOT NULL,
        "student_id"   integer NOT NULL,
        "started_at"   TIMESTAMP NOT NULL DEFAULT now(),
        "completed_at" TIMESTAMP,
        "score"        numeric(8,2),
        "passed"       boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_quiz_attempts" PRIMARY KEY ("attempt_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "quiz_attempts"
        ADD CONSTRAINT "FK_quiz_attempts_quiz"
        FOREIGN KEY ("quiz_id")
        REFERENCES "quizzes"("quiz_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "quiz_attempts"
        ADD CONSTRAINT "FK_quiz_attempts_student"
        FOREIGN KEY ("student_id")
        REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── assignments ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "assignments" (
        "assignment_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "lesson_id"     uuid NOT NULL,
        "title"         character varying(255) NOT NULL,
        "description"   text,
        "due_date"      TIMESTAMP,
        "max_score"     numeric(8,2) NOT NULL DEFAULT 100,
        "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_assignments" PRIMARY KEY ("assignment_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "assignments"
        ADD CONSTRAINT "FK_assignments_lesson"
        FOREIGN KEY ("lesson_id")
        REFERENCES "lessons"("lesson_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── submissions ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "submissions" (
        "submission_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "assignment_id" uuid NOT NULL,
        "student_id"    integer NOT NULL,
        "submitted_at"  TIMESTAMP NOT NULL DEFAULT now(),
        "grading"       jsonb,
        CONSTRAINT "PK_submissions" PRIMARY KEY ("submission_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "submissions"
        ADD CONSTRAINT "FK_submissions_assignment"
        FOREIGN KEY ("assignment_id")
        REFERENCES "assignments"("assignment_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "submissions"
        ADD CONSTRAINT "FK_submissions_student"
        FOREIGN KEY ("student_id")
        REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── downloadable_resources ───────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "downloadable_resources" (
        "resource_id"    uuid NOT NULL DEFAULT uuid_generate_v4(),
        "lesson_id"      uuid NOT NULL,
        "title"          character varying(255) NOT NULL,
        "download_count" integer NOT NULL DEFAULT 0,
        "created_at"     TIMESTAMP NOT NULL DEFAULT now(),
        "file_info"      jsonb,
        CONSTRAINT "PK_downloadable_resources" PRIMARY KEY ("resource_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "downloadable_resources"
        ADD CONSTRAINT "FK_downloadable_resources_lesson"
        FOREIGN KEY ("lesson_id")
        REFERENCES "lessons"("lesson_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── certificates ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "certificates" (
        "certificate_id"     uuid NOT NULL DEFAULT uuid_generate_v4(),
        "course_id"          uuid NOT NULL,
        "student_id"         integer NOT NULL,
        "certificate_number" character varying(100) NOT NULL,
        "issued_at"          TIMESTAMP NOT NULL DEFAULT now(),
        "expiry_date"        TIMESTAMP,
        "certificate_url"    character varying(500),
        "is_verified"        boolean NOT NULL DEFAULT false,
        "certificate_code"   character varying(24),
        CONSTRAINT "UQ_certificates_number" UNIQUE ("certificate_number"),
        CONSTRAINT "PK_certificates" PRIMARY KEY ("certificate_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "certificates"
        ADD CONSTRAINT "FK_certificates_course"
        FOREIGN KEY ("course_id")
        REFERENCES "courses"("course_id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "certificates"
        ADD CONSTRAINT "FK_certificates_student"
        FOREIGN KEY ("student_id")
        REFERENCES "user"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // ─── certificate_verifications ────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "certificate_verifications" (
        "verification_id"   uuid NOT NULL DEFAULT uuid_generate_v4(),
        "certificate_id"    uuid NOT NULL,
        "verified_at"       TIMESTAMP NOT NULL DEFAULT now(),
        "verification_data" jsonb,
        CONSTRAINT "PK_certificate_verifications" PRIMARY KEY ("verification_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "certificate_verifications"
        ADD CONSTRAINT "FK_certificate_verifications_certificate"
        FOREIGN KEY ("certificate_id")
        REFERENCES "certificates"("certificate_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── student_journey_data ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "student_journey_data" (
        "journey_id"             uuid NOT NULL DEFAULT uuid_generate_v4(),
        "student_id"             integer NOT NULL,
        "course_id"              uuid NOT NULL,
        "total_duration_seconds" integer NOT NULL DEFAULT 0,
        "progress_percentage"    numeric(5,2) NOT NULL DEFAULT 0,
        "last_accessed_at"       TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_journey_data" PRIMARY KEY ("journey_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "student_journey_data"
        ADD CONSTRAINT "FK_student_journey_data_student"
        FOREIGN KEY ("student_id")
        REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "student_journey_data"
        ADD CONSTRAINT "FK_student_journey_data_course"
        FOREIGN KEY ("course_id")
        REFERENCES "courses"("course_id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ─── Indexes ──────────────────────────────────────────────────────────────
    await queryRunner.query(
      `CREATE INDEX "IDX_courses_instructor" ON "courses" ("instructor_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_courses_category"   ON "courses" ("category_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_enrollments_student" ON "enrollments" ("student_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_enrollments_course"  ON "enrollments" ("course_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_lesson_progress_student" ON "lesson_progress" ("student_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_discussions_course"  ON "discussions" ("course_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_quiz_attempts_student" ON "quiz_attempts" ("student_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_submissions_student" ON "submissions" ("student_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Indexes
    await queryRunner.query(`DROP INDEX "public"."IDX_submissions_student"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_quiz_attempts_student"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_discussions_course"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_lesson_progress_student"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_enrollments_course"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_enrollments_student"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_courses_category"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_courses_instructor"`);

    // Tables in reverse dependency order
    await queryRunner.query(
      `ALTER TABLE "student_journey_data" DROP CONSTRAINT "FK_student_journey_data_course"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_journey_data" DROP CONSTRAINT "FK_student_journey_data_student"`,
    );
    await queryRunner.query(`DROP TABLE "student_journey_data"`);

    await queryRunner.query(
      `ALTER TABLE "certificate_verifications" DROP CONSTRAINT "FK_certificate_verifications_certificate"`,
    );
    await queryRunner.query(`DROP TABLE "certificate_verifications"`);

    await queryRunner.query(
      `ALTER TABLE "certificates" DROP CONSTRAINT "FK_certificates_student"`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" DROP CONSTRAINT "FK_certificates_course"`,
    );
    await queryRunner.query(`DROP TABLE "certificates"`);

    await queryRunner.query(
      `ALTER TABLE "downloadable_resources" DROP CONSTRAINT "FK_downloadable_resources_lesson"`,
    );
    await queryRunner.query(`DROP TABLE "downloadable_resources"`);

    await queryRunner.query(
      `ALTER TABLE "submissions" DROP CONSTRAINT "FK_submissions_student"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" DROP CONSTRAINT "FK_submissions_assignment"`,
    );
    await queryRunner.query(`DROP TABLE "submissions"`);

    await queryRunner.query(
      `ALTER TABLE "assignments" DROP CONSTRAINT "FK_assignments_lesson"`,
    );
    await queryRunner.query(`DROP TABLE "assignments"`);

    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_quiz_attempts_student"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_quiz_attempts_quiz"`,
    );
    await queryRunner.query(`DROP TABLE "quiz_attempts"`);

    await queryRunner.query(
      `ALTER TABLE "quizzes" DROP CONSTRAINT "FK_quizzes_lesson"`,
    );
    await queryRunner.query(`DROP TABLE "quizzes"`);

    await queryRunner.query(
      `ALTER TABLE "discussion_replies" DROP CONSTRAINT "FK_discussion_replies_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussion_replies" DROP CONSTRAINT "FK_discussion_replies_discussion"`,
    );
    await queryRunner.query(`DROP TABLE "discussion_replies"`);

    await queryRunner.query(
      `ALTER TABLE "discussions" DROP CONSTRAINT "FK_discussions_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussions" DROP CONSTRAINT "FK_discussions_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "discussions" DROP CONSTRAINT "FK_discussions_course"`,
    );
    await queryRunner.query(`DROP TABLE "discussions"`);

    await queryRunner.query(
      `ALTER TABLE "lesson_progress" DROP CONSTRAINT "FK_lesson_progress_student"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_progress" DROP CONSTRAINT "FK_lesson_progress_lesson"`,
    );
    await queryRunner.query(`DROP TABLE "lesson_progress"`);

    await queryRunner.query(
      `ALTER TABLE "lessons" DROP CONSTRAINT "FK_lessons_module"`,
    );
    await queryRunner.query(`DROP TABLE "lessons"`);

    await queryRunner.query(
      `ALTER TABLE "modules" DROP CONSTRAINT "FK_modules_course"`,
    );
    await queryRunner.query(`DROP TABLE "modules"`);

    await queryRunner.query(
      `ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_student"`,
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_course"`,
    );
    await queryRunner.query(`DROP TABLE "enrollments"`);

    await queryRunner.query(
      `ALTER TABLE "course_ratings" DROP CONSTRAINT "FK_course_ratings_student"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_ratings" DROP CONSTRAINT "FK_course_ratings_course"`,
    );
    await queryRunner.query(`DROP TABLE "course_ratings"`);

    await queryRunner.query(
      `ALTER TABLE "course_preview" DROP CONSTRAINT "FK_course_preview_course"`,
    );
    await queryRunner.query(`DROP TABLE "course_preview"`);

    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP CONSTRAINT "FK_user_role_assignments_role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP CONSTRAINT "FK_user_role_assignments_user"`,
    );
    await queryRunner.query(`DROP TABLE "user_role_assignments"`);

    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT "FK_courses_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT "FK_courses_instructor"`,
    );
    await queryRunner.query(`DROP TABLE "courses"`);

    await queryRunner.query(
      `ALTER TABLE "course_categories" DROP CONSTRAINT "FK_course_categories_parent"`,
    );
    await queryRunner.query(`DROP TABLE "course_categories"`);

    await queryRunner.query(`DROP TABLE "user_roles"`);
  }
}

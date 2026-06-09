-- =============================================================================
--  Course Learning Platform — Full Production Schema
--  PostgreSQL 14+
--
--  Usage:
--    psql -U <user> -d <database> -f init.sql
--
--  This script is idempotent: safe to re-run on a fresh database.
--  Run order: extensions → boilerplate tables → CLP tables → indexes.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Boilerplate: role, status, file, user, session
-- (created by the NestJS boilerplate migration)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "role" (
  "id"   INTEGER      NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  CONSTRAINT "PK_role" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "status" (
  "id"   INTEGER      NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  CONSTRAINT "PK_status" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "file" (
  "id"   UUID         NOT NULL DEFAULT uuid_generate_v4(),
  "path" VARCHAR(255) NOT NULL,
  CONSTRAINT "PK_file" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user" (
  "id"        SERIAL       NOT NULL,
  "email"     VARCHAR(255),
  "password"  VARCHAR(255),
  "provider"  VARCHAR(255) NOT NULL DEFAULT 'email',
  "socialId"  VARCHAR(255),
  "firstName" VARCHAR(255),
  "lastName"  VARCHAR(255),
  "createdAt" TIMESTAMP    NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP    NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMP,
  "photoId"   UUID,
  "roleId"    INTEGER,
  "statusId"  INTEGER,
  CONSTRAINT "UQ_user_email"   UNIQUE ("email"),
  CONSTRAINT "REL_user_photo"  UNIQUE ("photoId"),
  CONSTRAINT "PK_user"         PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_user_socialId"   ON "user" ("socialId");
CREATE INDEX IF NOT EXISTS "IDX_user_firstName"  ON "user" ("firstName");
CREATE INDEX IF NOT EXISTS "IDX_user_lastName"   ON "user" ("lastName");

ALTER TABLE "user"
  ADD CONSTRAINT "FK_user_photo"
  FOREIGN KEY ("photoId") REFERENCES "file"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION
  NOT VALID;          -- skip row-by-row validation on fresh DB, fast

ALTER TABLE "user"
  ADD CONSTRAINT "FK_user_role"
  FOREIGN KEY ("roleId") REFERENCES "role"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION
  NOT VALID;

ALTER TABLE "user"
  ADD CONSTRAINT "FK_user_status"
  FOREIGN KEY ("statusId") REFERENCES "status"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION
  NOT VALID;

CREATE TABLE IF NOT EXISTS "session" (
  "id"        SERIAL       NOT NULL,
  "hash"      VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP    NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP    NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMP,
  "userId"    INTEGER,
  CONSTRAINT "PK_session" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_session_userId" ON "session" ("userId");

ALTER TABLE "session"
  ADD CONSTRAINT "FK_session_user"
  FOREIGN KEY ("userId") REFERENCES "user"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION
  NOT VALID;

-- ---------------------------------------------------------------------------
-- Seed: default roles and statuses expected by the boilerplate
-- ---------------------------------------------------------------------------

INSERT INTO "role"   ("id", "name") VALUES (1, 'Admin'),    (2, 'User')
  ON CONFLICT ("id") DO NOTHING;

INSERT INTO "status" ("id", "name") VALUES (1, 'Active'),   (2, 'Inactive')
  ON CONFLICT ("id") DO NOTHING;

-- =============================================================================
--  CLP Tables
-- =============================================================================

-- ---------------------------------------------------------------------------
-- user_roles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "user_roles" (
  "role_id"     UUID         NOT NULL DEFAULT uuid_generate_v4(),
  "role_name"   VARCHAR(100) NOT NULL,
  "description" TEXT,
  CONSTRAINT "PK_user_roles" PRIMARY KEY ("role_id")
);

-- ---------------------------------------------------------------------------
-- user_role_assignments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "user_role_assignments" (
  "assignment_id" UUID      NOT NULL DEFAULT uuid_generate_v4(),
  "user_id"       INTEGER   NOT NULL,
  "role_id"       UUID      NOT NULL,
  "assigned_at"   TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_user_role_assignments" PRIMARY KEY ("assignment_id")
);

ALTER TABLE "user_role_assignments"
  ADD CONSTRAINT "FK_ura_user"
  FOREIGN KEY ("user_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

ALTER TABLE "user_role_assignments"
  ADD CONSTRAINT "FK_ura_role"
  FOREIGN KEY ("role_id") REFERENCES "user_roles"("role_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- course_categories  (self-referencing hierarchy)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "course_categories" (
  "category_id"        UUID         NOT NULL DEFAULT uuid_generate_v4(),
  "name"               VARCHAR(255) NOT NULL,
  "slug"               VARCHAR(255) NOT NULL,
  "description"        TEXT,
  "thumbnail"          VARCHAR(500),
  "parent_category_id" UUID,
  "path"               VARCHAR(500),
  "sort_order"         INTEGER      NOT NULL DEFAULT 0,
  "is_active"          BOOLEAN      NOT NULL DEFAULT TRUE,
  "created_at"         TIMESTAMP    NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_course_categories_slug" UNIQUE ("slug"),
  CONSTRAINT "PK_course_categories"      PRIMARY KEY ("category_id")
);

ALTER TABLE "course_categories"
  ADD CONSTRAINT "FK_course_categories_parent"
  FOREIGN KEY ("parent_category_id") REFERENCES "course_categories"("category_id")
  ON DELETE SET NULL ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "courses" (
  "course_id"     UUID           NOT NULL DEFAULT uuid_generate_v4(),
  "instructor_id" INTEGER        NOT NULL,
  "category_id"   UUID,
  "title"         VARCHAR(255)   NOT NULL,
  "description"   TEXT,
  "price"         NUMERIC(18, 2) NOT NULL DEFAULT 0,
  "thumbnail"     VARCHAR(500),
  "is_published"  BOOLEAN        NOT NULL DEFAULT FALSE,
  "meta"          JSONB,
  CONSTRAINT "PK_courses" PRIMARY KEY ("course_id")
);

CREATE INDEX IF NOT EXISTS "IDX_courses_instructor" ON "courses" ("instructor_id");
CREATE INDEX IF NOT EXISTS "IDX_courses_category"   ON "courses" ("category_id");

ALTER TABLE "courses"
  ADD CONSTRAINT "FK_courses_instructor"
  FOREIGN KEY ("instructor_id") REFERENCES "user"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION NOT VALID;

ALTER TABLE "courses"
  ADD CONSTRAINT "FK_courses_category"
  FOREIGN KEY ("category_id") REFERENCES "course_categories"("category_id")
  ON DELETE SET NULL ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- course_preview
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "course_preview" (
  "preview_id"       UUID         NOT NULL DEFAULT uuid_generate_v4(),
  "course_id"        UUID         NOT NULL,
  "preview_url"      VARCHAR(500) NOT NULL,
  "is_active"        BOOLEAN      NOT NULL DEFAULT TRUE,
  "thumbnail"        VARCHAR(500),
  "duration_seconds" INTEGER      NOT NULL DEFAULT 0,
  "order_index"      INTEGER      NOT NULL DEFAULT 0,
  CONSTRAINT "PK_course_preview" PRIMARY KEY ("preview_id")
);

ALTER TABLE "course_preview"
  ADD CONSTRAINT "FK_course_preview_course"
  FOREIGN KEY ("course_id") REFERENCES "courses"("course_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- course_ratings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "course_ratings" (
  "rating_id"  UUID      NOT NULL DEFAULT uuid_generate_v4(),
  "course_id"  UUID      NOT NULL,
  "student_id" INTEGER   NOT NULL,
  "rating"     INTEGER   NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
  "review"     TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_course_ratings" PRIMARY KEY ("rating_id")
);

CREATE INDEX IF NOT EXISTS "IDX_course_ratings_course"   ON "course_ratings" ("course_id");
CREATE INDEX IF NOT EXISTS "IDX_course_ratings_student"  ON "course_ratings" ("student_id");

ALTER TABLE "course_ratings"
  ADD CONSTRAINT "FK_course_ratings_course"
  FOREIGN KEY ("course_id") REFERENCES "courses"("course_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

ALTER TABLE "course_ratings"
  ADD CONSTRAINT "FK_course_ratings_student"
  FOREIGN KEY ("student_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- enrollments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "enrollments" (
  "enrollment_id"       UUID           NOT NULL DEFAULT uuid_generate_v4(),
  "course_id"           UUID           NOT NULL,
  "student_id"          INTEGER        NOT NULL,
  "enrolled_at"         TIMESTAMP      NOT NULL DEFAULT now(),
  "progress_percentage" NUMERIC(5, 2)  NOT NULL DEFAULT 0,
  "status"              VARCHAR(50)    NOT NULL DEFAULT 'active',
  CONSTRAINT "PK_enrollments" PRIMARY KEY ("enrollment_id")
);

CREATE INDEX IF NOT EXISTS "IDX_enrollments_student" ON "enrollments" ("student_id");
CREATE INDEX IF NOT EXISTS "IDX_enrollments_course"  ON "enrollments" ("course_id");

ALTER TABLE "enrollments"
  ADD CONSTRAINT "FK_enrollments_course"
  FOREIGN KEY ("course_id") REFERENCES "courses"("course_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

ALTER TABLE "enrollments"
  ADD CONSTRAINT "FK_enrollments_student"
  FOREIGN KEY ("student_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- modules
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "modules" (
  "module_id"    UUID         NOT NULL DEFAULT uuid_generate_v4(),
  "course_id"    UUID         NOT NULL,
  "title"        VARCHAR(255) NOT NULL,
  "description"  TEXT,
  "order_index"  INTEGER      NOT NULL DEFAULT 0,
  "is_published" BOOLEAN      NOT NULL DEFAULT FALSE,
  "created_at"   TIMESTAMP    NOT NULL DEFAULT now(),
  CONSTRAINT "PK_modules" PRIMARY KEY ("module_id")
);

CREATE INDEX IF NOT EXISTS "IDX_modules_course" ON "modules" ("course_id");

ALTER TABLE "modules"
  ADD CONSTRAINT "FK_modules_course"
  FOREIGN KEY ("course_id") REFERENCES "courses"("course_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- lessons
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "lessons" (
  "lesson_id"              UUID         NOT NULL DEFAULT uuid_generate_v4(),
  "module_id"              UUID         NOT NULL,
  "title"                  VARCHAR(500) NOT NULL,
  "content_type"           VARCHAR(100) NOT NULL,
  "content"                VARCHAR(500),
  "video_duration_seconds" INTEGER      NOT NULL DEFAULT 0,
  "order_index"            INTEGER      NOT NULL DEFAULT 0,
  "is_free"                BOOLEAN      NOT NULL DEFAULT FALSE,
  "created_at"             TIMESTAMP    NOT NULL DEFAULT now(),
  CONSTRAINT "PK_lessons" PRIMARY KEY ("lesson_id")
);

CREATE INDEX IF NOT EXISTS "IDX_lessons_module" ON "lessons" ("module_id");

ALTER TABLE "lessons"
  ADD CONSTRAINT "FK_lessons_module"
  FOREIGN KEY ("module_id") REFERENCES "modules"("module_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- lesson_progress
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "lesson_progress" (
  "progress_id"              UUID          NOT NULL DEFAULT uuid_generate_v4(),
  "lesson_id"                UUID          NOT NULL,
  "student_id"               INTEGER       NOT NULL,
  "watched_duration_seconds" INTEGER       NOT NULL DEFAULT 0,
  "percentage_watched"       NUMERIC(5, 2) NOT NULL DEFAULT 0,
  "last_watched_at"          TIMESTAMP     NOT NULL DEFAULT now(),
  "is_completed"             BOOLEAN       NOT NULL DEFAULT FALSE,
  CONSTRAINT "PK_lesson_progress" PRIMARY KEY ("progress_id")
);

CREATE INDEX IF NOT EXISTS "IDX_lesson_progress_lesson"  ON "lesson_progress" ("lesson_id");
CREATE INDEX IF NOT EXISTS "IDX_lesson_progress_student" ON "lesson_progress" ("student_id");

ALTER TABLE "lesson_progress"
  ADD CONSTRAINT "FK_lesson_progress_lesson"
  FOREIGN KEY ("lesson_id") REFERENCES "lessons"("lesson_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

ALTER TABLE "lesson_progress"
  ADD CONSTRAINT "FK_lesson_progress_student"
  FOREIGN KEY ("student_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- discussions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "discussions" (
  "discussion_id" UUID         NOT NULL DEFAULT uuid_generate_v4(),
  "course_id"     UUID         NOT NULL,
  "user_id"       INTEGER      NOT NULL,
  "category_id"   UUID,
  "title"         VARCHAR(255) NOT NULL,
  "content"       TEXT         NOT NULL,
  "created_at"    TIMESTAMP    NOT NULL DEFAULT now(),
  "updated_at"    TIMESTAMP    NOT NULL DEFAULT now(),
  CONSTRAINT "PK_discussions" PRIMARY KEY ("discussion_id")
);

CREATE INDEX IF NOT EXISTS "IDX_discussions_course" ON "discussions" ("course_id");
CREATE INDEX IF NOT EXISTS "IDX_discussions_user"   ON "discussions" ("user_id");

ALTER TABLE "discussions"
  ADD CONSTRAINT "FK_discussions_course"
  FOREIGN KEY ("course_id") REFERENCES "courses"("course_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

ALTER TABLE "discussions"
  ADD CONSTRAINT "FK_discussions_user"
  FOREIGN KEY ("user_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

ALTER TABLE "discussions"
  ADD CONSTRAINT "FK_discussions_category"
  FOREIGN KEY ("category_id") REFERENCES "course_categories"("category_id")
  ON DELETE SET NULL ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- discussion_replies
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "discussion_replies" (
  "reply_id"      UUID      NOT NULL DEFAULT uuid_generate_v4(),
  "discussion_id" UUID      NOT NULL,
  "user_id"       INTEGER   NOT NULL,
  "content"       TEXT      NOT NULL,
  "created_at"    TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_discussion_replies" PRIMARY KEY ("reply_id")
);

CREATE INDEX IF NOT EXISTS "IDX_discussion_replies_discussion" ON "discussion_replies" ("discussion_id");
CREATE INDEX IF NOT EXISTS "IDX_discussion_replies_user"       ON "discussion_replies" ("user_id");

ALTER TABLE "discussion_replies"
  ADD CONSTRAINT "FK_discussion_replies_discussion"
  FOREIGN KEY ("discussion_id") REFERENCES "discussions"("discussion_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

ALTER TABLE "discussion_replies"
  ADD CONSTRAINT "FK_discussion_replies_user"
  FOREIGN KEY ("user_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- quizzes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "quizzes" (
  "quiz_id"            UUID          NOT NULL DEFAULT uuid_generate_v4(),
  "lesson_id"          UUID          NOT NULL,
  "title"              VARCHAR(255)  NOT NULL,
  "time_limit_minutes" INTEGER,
  "passing_score"      NUMERIC(5, 2) NOT NULL DEFAULT 60,
  "created_at"         TIMESTAMP     NOT NULL DEFAULT now(),
  CONSTRAINT "PK_quizzes" PRIMARY KEY ("quiz_id")
);

CREATE INDEX IF NOT EXISTS "IDX_quizzes_lesson" ON "quizzes" ("lesson_id");

ALTER TABLE "quizzes"
  ADD CONSTRAINT "FK_quizzes_lesson"
  FOREIGN KEY ("lesson_id") REFERENCES "lessons"("lesson_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- quiz_attempts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "quiz_attempts" (
  "attempt_id"   UUID          NOT NULL DEFAULT uuid_generate_v4(),
  "quiz_id"      UUID          NOT NULL,
  "student_id"   INTEGER       NOT NULL,
  "started_at"   TIMESTAMP     NOT NULL DEFAULT now(),
  "completed_at" TIMESTAMP,
  "score"        NUMERIC(8, 2),
  "passed"       BOOLEAN       NOT NULL DEFAULT FALSE,
  CONSTRAINT "PK_quiz_attempts" PRIMARY KEY ("attempt_id")
);

CREATE INDEX IF NOT EXISTS "IDX_quiz_attempts_quiz"    ON "quiz_attempts" ("quiz_id");
CREATE INDEX IF NOT EXISTS "IDX_quiz_attempts_student" ON "quiz_attempts" ("student_id");

ALTER TABLE "quiz_attempts"
  ADD CONSTRAINT "FK_quiz_attempts_quiz"
  FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("quiz_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

ALTER TABLE "quiz_attempts"
  ADD CONSTRAINT "FK_quiz_attempts_student"
  FOREIGN KEY ("student_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- assignments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "assignments" (
  "assignment_id" UUID          NOT NULL DEFAULT uuid_generate_v4(),
  "lesson_id"     UUID          NOT NULL,
  "title"         VARCHAR(255)  NOT NULL,
  "description"   TEXT,
  "due_date"      TIMESTAMP,
  "max_score"     NUMERIC(8, 2) NOT NULL DEFAULT 100,
  "created_at"    TIMESTAMP     NOT NULL DEFAULT now(),
  CONSTRAINT "PK_assignments" PRIMARY KEY ("assignment_id")
);

CREATE INDEX IF NOT EXISTS "IDX_assignments_lesson" ON "assignments" ("lesson_id");

ALTER TABLE "assignments"
  ADD CONSTRAINT "FK_assignments_lesson"
  FOREIGN KEY ("lesson_id") REFERENCES "lessons"("lesson_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- submissions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "submissions" (
  "submission_id" UUID      NOT NULL DEFAULT uuid_generate_v4(),
  "assignment_id" UUID      NOT NULL,
  "student_id"    INTEGER   NOT NULL,
  "submitted_at"  TIMESTAMP NOT NULL DEFAULT now(),
  "grading"       JSONB,
  CONSTRAINT "PK_submissions" PRIMARY KEY ("submission_id")
);

CREATE INDEX IF NOT EXISTS "IDX_submissions_assignment" ON "submissions" ("assignment_id");
CREATE INDEX IF NOT EXISTS "IDX_submissions_student"    ON "submissions" ("student_id");

ALTER TABLE "submissions"
  ADD CONSTRAINT "FK_submissions_assignment"
  FOREIGN KEY ("assignment_id") REFERENCES "assignments"("assignment_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

ALTER TABLE "submissions"
  ADD CONSTRAINT "FK_submissions_student"
  FOREIGN KEY ("student_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- downloadable_resources
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "downloadable_resources" (
  "resource_id"    UUID         NOT NULL DEFAULT uuid_generate_v4(),
  "lesson_id"      UUID         NOT NULL,
  "title"          VARCHAR(255) NOT NULL,
  "download_count" INTEGER      NOT NULL DEFAULT 0,
  "created_at"     TIMESTAMP    NOT NULL DEFAULT now(),
  "file_info"      JSONB,
  CONSTRAINT "PK_downloadable_resources" PRIMARY KEY ("resource_id")
);

CREATE INDEX IF NOT EXISTS "IDX_downloadable_resources_lesson" ON "downloadable_resources" ("lesson_id");

ALTER TABLE "downloadable_resources"
  ADD CONSTRAINT "FK_downloadable_resources_lesson"
  FOREIGN KEY ("lesson_id") REFERENCES "lessons"("lesson_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- certificates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "certificates" (
  "certificate_id"     UUID         NOT NULL DEFAULT uuid_generate_v4(),
  "course_id"          UUID         NOT NULL,
  "student_id"         INTEGER      NOT NULL,
  "certificate_number" VARCHAR(100) NOT NULL,
  "issued_at"          TIMESTAMP    NOT NULL DEFAULT now(),
  "expiry_date"        TIMESTAMP,
  "certificate_url"    VARCHAR(500),
  "is_verified"        BOOLEAN      NOT NULL DEFAULT FALSE,
  "certificate_code"   VARCHAR(24),
  CONSTRAINT "UQ_certificates_number"  UNIQUE ("certificate_number"),
  CONSTRAINT "PK_certificates"         PRIMARY KEY ("certificate_id")
);

CREATE INDEX IF NOT EXISTS "IDX_certificates_course"   ON "certificates" ("course_id");
CREATE INDEX IF NOT EXISTS "IDX_certificates_student"  ON "certificates" ("student_id");

ALTER TABLE "certificates"
  ADD CONSTRAINT "FK_certificates_course"
  FOREIGN KEY ("course_id") REFERENCES "courses"("course_id")
  ON DELETE NO ACTION ON UPDATE NO ACTION NOT VALID;

ALTER TABLE "certificates"
  ADD CONSTRAINT "FK_certificates_student"
  FOREIGN KEY ("student_id") REFERENCES "user"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- certificate_verifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "certificate_verifications" (
  "verification_id"   UUID      NOT NULL DEFAULT uuid_generate_v4(),
  "certificate_id"    UUID      NOT NULL,
  "verified_at"       TIMESTAMP NOT NULL DEFAULT now(),
  "verification_data" JSONB,
  CONSTRAINT "PK_certificate_verifications" PRIMARY KEY ("verification_id")
);

CREATE INDEX IF NOT EXISTS "IDX_cert_verifications_cert" ON "certificate_verifications" ("certificate_id");

ALTER TABLE "certificate_verifications"
  ADD CONSTRAINT "FK_certificate_verifications_certificate"
  FOREIGN KEY ("certificate_id") REFERENCES "certificates"("certificate_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- student_journey_data
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "student_journey_data" (
  "journey_id"             UUID          NOT NULL DEFAULT uuid_generate_v4(),
  "student_id"             INTEGER       NOT NULL,
  "course_id"              UUID          NOT NULL,
  "total_duration_seconds" INTEGER       NOT NULL DEFAULT 0,
  "progress_percentage"    NUMERIC(5, 2) NOT NULL DEFAULT 0,
  "last_accessed_at"       TIMESTAMP     NOT NULL DEFAULT now(),
  CONSTRAINT "PK_student_journey_data" PRIMARY KEY ("journey_id")
);

CREATE INDEX IF NOT EXISTS "IDX_student_journey_student" ON "student_journey_data" ("student_id");
CREATE INDEX IF NOT EXISTS "IDX_student_journey_course"  ON "student_journey_data" ("course_id");

ALTER TABLE "student_journey_data"
  ADD CONSTRAINT "FK_student_journey_data_student"
  FOREIGN KEY ("student_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

ALTER TABLE "student_journey_data"
  ADD CONSTRAINT "FK_student_journey_data_course"
  FOREIGN KEY ("course_id") REFERENCES "courses"("course_id")
  ON DELETE CASCADE ON UPDATE NO ACTION NOT VALID;

-- ---------------------------------------------------------------------------
-- Validate all deferred FK constraints
-- ---------------------------------------------------------------------------
ALTER TABLE "user"                    VALIDATE CONSTRAINT "FK_user_photo";
ALTER TABLE "user"                    VALIDATE CONSTRAINT "FK_user_role";
ALTER TABLE "user"                    VALIDATE CONSTRAINT "FK_user_status";
ALTER TABLE "session"                 VALIDATE CONSTRAINT "FK_session_user";
ALTER TABLE "course_categories"       VALIDATE CONSTRAINT "FK_course_categories_parent";
ALTER TABLE "courses"                 VALIDATE CONSTRAINT "FK_courses_instructor";
ALTER TABLE "courses"                 VALIDATE CONSTRAINT "FK_courses_category";
ALTER TABLE "user_role_assignments"   VALIDATE CONSTRAINT "FK_ura_user";
ALTER TABLE "user_role_assignments"   VALIDATE CONSTRAINT "FK_ura_role";
ALTER TABLE "course_preview"          VALIDATE CONSTRAINT "FK_course_preview_course";
ALTER TABLE "course_ratings"          VALIDATE CONSTRAINT "FK_course_ratings_course";
ALTER TABLE "course_ratings"          VALIDATE CONSTRAINT "FK_course_ratings_student";
ALTER TABLE "enrollments"             VALIDATE CONSTRAINT "FK_enrollments_course";
ALTER TABLE "enrollments"             VALIDATE CONSTRAINT "FK_enrollments_student";
ALTER TABLE "modules"                 VALIDATE CONSTRAINT "FK_modules_course";
ALTER TABLE "lessons"                 VALIDATE CONSTRAINT "FK_lessons_module";
ALTER TABLE "lesson_progress"         VALIDATE CONSTRAINT "FK_lesson_progress_lesson";
ALTER TABLE "lesson_progress"         VALIDATE CONSTRAINT "FK_lesson_progress_student";
ALTER TABLE "discussions"             VALIDATE CONSTRAINT "FK_discussions_course";
ALTER TABLE "discussions"             VALIDATE CONSTRAINT "FK_discussions_user";
ALTER TABLE "discussions"             VALIDATE CONSTRAINT "FK_discussions_category";
ALTER TABLE "discussion_replies"      VALIDATE CONSTRAINT "FK_discussion_replies_discussion";
ALTER TABLE "discussion_replies"      VALIDATE CONSTRAINT "FK_discussion_replies_user";
ALTER TABLE "quizzes"                 VALIDATE CONSTRAINT "FK_quizzes_lesson";
ALTER TABLE "quiz_attempts"           VALIDATE CONSTRAINT "FK_quiz_attempts_quiz";
ALTER TABLE "quiz_attempts"           VALIDATE CONSTRAINT "FK_quiz_attempts_student";
ALTER TABLE "assignments"             VALIDATE CONSTRAINT "FK_assignments_lesson";
ALTER TABLE "submissions"             VALIDATE CONSTRAINT "FK_submissions_assignment";
ALTER TABLE "submissions"             VALIDATE CONSTRAINT "FK_submissions_student";
ALTER TABLE "downloadable_resources"  VALIDATE CONSTRAINT "FK_downloadable_resources_lesson";
ALTER TABLE "certificates"            VALIDATE CONSTRAINT "FK_certificates_course";
ALTER TABLE "certificates"            VALIDATE CONSTRAINT "FK_certificates_student";
ALTER TABLE "certificate_verifications" VALIDATE CONSTRAINT "FK_certificate_verifications_certificate";
ALTER TABLE "student_journey_data"    VALIDATE CONSTRAINT "FK_student_journey_data_student";
ALTER TABLE "student_journey_data"    VALIDATE CONSTRAINT "FK_student_journey_data_course";

COMMIT;

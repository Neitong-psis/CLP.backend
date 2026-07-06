import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRelationalCurriculumTables1781096936879 implements MigrationInterface {
  name = 'CreateRelationalCurriculumTables1781096936879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_user_photo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_user_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_categories" DROP CONSTRAINT "FK_course_categories_parent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT "FK_courses_instructor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT "FK_courses_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" DROP CONSTRAINT "FK_lessons_module"`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" DROP CONSTRAINT "FK_modules_course"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quizzes" DROP CONSTRAINT "FK_quizzes_lesson"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignments" DROP CONSTRAINT "FK_assignments_lesson"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP CONSTRAINT "FK_user_role_assignments_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP CONSTRAINT "FK_user_role_assignments_role"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_courses_instructor"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_courses_category"`);
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP CONSTRAINT "PK_user_role_assignments"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP COLUMN "assignment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP COLUMN "assigned_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" ADD CONSTRAINT "PK_d840445bb72ff3e0a09d464c1a5" PRIMARY KEY ("user_id", "role_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_75e2be4ce11d447ef43be0e374f" UNIQUE ("photoId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_03eb0e6d5ebfdb266edecb67c7" ON "user_role_assignments" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_daf3517bf1fd13552a06b78dc9" ON "user_role_assignments" ("role_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_75e2be4ce11d447ef43be0e374f" FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_dc18daa696860586ba4667a9d31" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_categories" ADD CONSTRAINT "FK_3938e91ad70ed3bc17b4880dd4c" FOREIGN KEY ("parent_category_id") REFERENCES "course_categories"("category_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD CONSTRAINT "FK_4fdc83dd6b261101401ec259342" FOREIGN KEY ("instructor_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD CONSTRAINT "FK_e4c260fe6bb1131707c4617f745" FOREIGN KEY ("category_id") REFERENCES "course_categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD CONSTRAINT "FK_35fb2307535d90a6ed290af1f4a" FOREIGN KEY ("module_id") REFERENCES "modules"("module_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" ADD CONSTRAINT "FK_0a00005552998b16b7e89340843" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quizzes" ADD CONSTRAINT "FK_2cf4e4b5b533af8dc6b38d4fa9b" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("lesson_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignments" ADD CONSTRAINT "FK_c0fda9de424e0e719787f6b5764" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("lesson_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" ADD CONSTRAINT "FK_03eb0e6d5ebfdb266edecb67c7a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" ADD CONSTRAINT "FK_daf3517bf1fd13552a06b78dc91" FOREIGN KEY ("role_id") REFERENCES "user_roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP CONSTRAINT "FK_daf3517bf1fd13552a06b78dc91"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP CONSTRAINT "FK_03eb0e6d5ebfdb266edecb67c7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignments" DROP CONSTRAINT "FK_c0fda9de424e0e719787f6b5764"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quizzes" DROP CONSTRAINT "FK_2cf4e4b5b533af8dc6b38d4fa9b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" DROP CONSTRAINT "FK_0a00005552998b16b7e89340843"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" DROP CONSTRAINT "FK_35fb2307535d90a6ed290af1f4a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT "FK_e4c260fe6bb1131707c4617f745"`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT "FK_4fdc83dd6b261101401ec259342"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_categories" DROP CONSTRAINT "FK_3938e91ad70ed3bc17b4880dd4c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_dc18daa696860586ba4667a9d31"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_75e2be4ce11d447ef43be0e374f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_daf3517bf1fd13552a06b78dc9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_03eb0e6d5ebfdb266edecb67c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_75e2be4ce11d447ef43be0e374f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" DROP CONSTRAINT "PK_d840445bb72ff3e0a09d464c1a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" ADD "assigned_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" ADD "assignment_id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" ADD CONSTRAINT "PK_user_role_assignments" PRIMARY KEY ("assignment_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_courses_category" ON "courses" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_courses_instructor" ON "courses" ("instructor_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" ADD CONSTRAINT "FK_user_role_assignments_role" FOREIGN KEY ("role_id") REFERENCES "user_roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_assignments" ADD CONSTRAINT "FK_user_role_assignments_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignments" ADD CONSTRAINT "FK_assignments_lesson" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("lesson_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quizzes" ADD CONSTRAINT "FK_quizzes_lesson" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("lesson_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" ADD CONSTRAINT "FK_modules_course" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD CONSTRAINT "FK_lessons_module" FOREIGN KEY ("module_id") REFERENCES "modules"("module_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD CONSTRAINT "FK_courses_category" FOREIGN KEY ("category_id") REFERENCES "course_categories"("category_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD CONSTRAINT "FK_courses_instructor" FOREIGN KEY ("instructor_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_categories" ADD CONSTRAINT "FK_course_categories_parent" FOREIGN KEY ("parent_category_id") REFERENCES "course_categories"("category_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_user_status" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_user_photo" FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}

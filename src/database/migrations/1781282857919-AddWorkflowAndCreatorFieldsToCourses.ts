import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkflowAndCreatorFieldsToCourses1781282857919 implements MigrationInterface {
  name = 'AddWorkflowAndCreatorFieldsToCourses1781282857919';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ───  add columns  ──────────────────────────────────
    await queryRunner.query(`ALTER TABLE "courses" ADD "created_by_id" uuid`);
    await queryRunner.query(`ALTER TABLE "courses" ADD "assigned_by_id" uuid`);
    await queryRunner.query(`ALTER TABLE "courses" ADD "due_date" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "courses" ADD "priority" varchar(20)`);

    // ─── Add constraints ──────────────────────────────────
    await queryRunner.query(`
            ALTER TABLE "courses" 
            ADD CONSTRAINT "FK_courses_created_by" 
            FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "courses" 
            ADD CONSTRAINT "FK_courses_assigned_by" 
            FOREIGN KEY ("assigned_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

    // ───  add index  ──────────────────────────────────
    await queryRunner.query(
      `CREATE INDEX "IDX_courses_created_by" ON "courses" ("created_by_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_courses_assigned_by" ON "courses" ("assigned_by_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ─── drop columns  ──────────────────────────────────
    await queryRunner.query(`DROP INDEX "IDX_courses_assigned_by"`);
    await queryRunner.query(`DROP INDEX "IDX_courses_created_by"`);

    // ─── drop constraints  ──────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT "FK_courses_assigned_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT "FK_courses_created_by"`,
    );

    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "priority"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "due_date"`);
    await queryRunner.query(
      `ALTER TABLE "courses" DROP COLUMN "assigned_by_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP COLUMN "created_by_id"`,
    );
  }
}

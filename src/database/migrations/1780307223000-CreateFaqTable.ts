import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFaqTable1780307223000 implements MigrationInterface {
  name = 'CreateFaqTable1780307223000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "faq" (
        "id" SERIAL NOT NULL,
        "question" text NOT NULL,
        "answer" text NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_faq" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "faq"`);
  }
}

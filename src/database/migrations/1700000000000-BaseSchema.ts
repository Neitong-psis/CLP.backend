import { MigrationInterface, QueryRunner } from 'typeorm';

export class BaseSchema1700000000000 implements MigrationInterface {
  name = 'BaseSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ─── file ─────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "file" (
        "id"   uuid NOT NULL DEFAULT uuid_generate_v4(),
        "path" character varying NOT NULL,
        CONSTRAINT "PK_file" PRIMARY KEY ("id")
      )
    `);

    // ─── status ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "status" (
        "id"   integer NOT NULL,
        "name" character varying NOT NULL,
        CONSTRAINT "PK_status" PRIMARY KEY ("id")
      )
    `);

    // ─── user ─────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id"         SERIAL NOT NULL,
        "email"      character varying UNIQUE,
        "password"   character varying,
        "firstName"  character varying,
        "lastName"   character varying,
        "photoId"    uuid,
        "socialId"   character varying,
        "provider"   character varying DEFAULT 'email',
        "statusId"   integer,
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"  TIMESTAMP,
        CONSTRAINT "PK_user" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "user"
        ADD CONSTRAINT "FK_user_photo"
        FOREIGN KEY ("photoId")
        REFERENCES "file"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "user"
        ADD CONSTRAINT "FK_user_status"
        FOREIGN KEY ("statusId")
        REFERENCES "status"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // ─── session ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "session" (
        "id"         SERIAL NOT NULL,
        "hash"       character varying NOT NULL,
        "userId"     integer,
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"  TIMESTAMP,
        CONSTRAINT "PK_session" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_3d2f174ef04fb312fdebd0ddc5" ON "session" ("userId")`,
    );
    await queryRunner.query(`
      ALTER TABLE "session"
        ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"
        FOREIGN KEY ("userId")
        REFERENCES "user"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3d2f174ef04fb312fdebd0ddc5"`,
    );
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_user_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_user_photo"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "status"`);
    await queryRunner.query(`DROP TABLE "file"`);
  }
}

import 'dotenv/config';
import { AppDataSource } from './data-source';

async function run() {
  console.log('Initializing DataSource...');
  await AppDataSource.initialize();
  console.log('DataSource initialized.');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  console.log('Checking/creating migrations table...');
  await queryRunner.query(`
    CREATE TABLE IF NOT EXISTS "migrations" (
      "id" SERIAL NOT NULL,
      "timestamp" bigint NOT NULL,
      "name" varchar NOT NULL,
      CONSTRAINT "PK_migrations" PRIMARY KEY ("id")
    )
  `);

  console.log('Creating faq table...');
  await queryRunner.query(`
    CREATE TABLE IF NOT EXISTS "faq" (
      "id" SERIAL NOT NULL,
      "question" text NOT NULL,
      "answer" text NOT NULL,
      "sort_order" integer NOT NULL DEFAULT 0,
      "is_active" boolean NOT NULL DEFAULT true,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_faq" PRIMARY KEY ("id")
    )
  `);

  console.log('Inserting migration records to sync TypeORM...');
  const existingMigrations = await queryRunner.query(
    `SELECT name FROM "migrations"`,
  );
  const names = existingMigrations.map((m: any) => m.name);

  const migrationsToInsert = [
    { timestamp: 1748361600000, name: 'CreateCLPSchema1748361600000' },
    { timestamp: 1779938199709, name: 'InitSchema1779938199709' },
    { timestamp: 1780307223000, name: 'CreateFaqTable1780307223000' },
  ];

  for (const m of migrationsToInsert) {
    if (!names.includes(m.name)) {
      await queryRunner.query(
        `INSERT INTO "migrations" (timestamp, name) VALUES ($1, $2)`,
        [m.timestamp, m.name],
      );
      console.log(`Inserted migration log: ${m.name}`);
    } else {
      console.log(`Migration log already exists: ${m.name}`);
    }
  }

  await queryRunner.release();
  await AppDataSource.destroy();
  console.log('Done.');
}

run().catch((err) => {
  console.error('Error executing scratch script:', err);
  process.exit(1);
});

/**
 * Demo seed — standalone script, no NestJS startup required.
 *
 * Prerequisites: database must be running.
 *
 * Option A — local dev (docker-compose.dev.yml exposes port 5432):
 *   docker compose -f docker-compose.dev.yml up -d
 *   cd backend
 *   DATABASE_HOST=localhost node scripts/demo-seed.js
 *
 * Option B — inside the running api container (full docker compose up):
 *   docker compose exec api node scripts/demo-seed.js
 *
 * Reads remaining config from backend/.env (falls back to env-example-relational defaults).
 * Safe to re-run — every insert is skipped if the email already exists.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// ── Config ────────────────────────────────────────────────────────────────────

const DB = {
  host:     process.env.DATABASE_HOST     || 'localhost',
  port:     parseInt(process.env.DATABASE_PORT || '5432'),
  user:     process.env.DATABASE_USERNAME || 'root',
  password: process.env.DATABASE_PASSWORD || 'secret',
  database: process.env.DATABASE_NAME     || 'api',
};

const DEMO_PASSWORD = 'Demo@1234';

// Role UUIDs — must match RoleEnum in src/roles/roles.enum.ts
const ROLES = {
  admin:    'e3e6012e-9d29-4e78-831d-d2427a1dfa01',
  educator: 'e3e6012e-9d29-4e78-831d-d2427a1dfa02',
  learner:  'e3e6012e-9d29-4e78-831d-d2427a1dfa03',
};

// Demo users — names/emails match frontend mock data constants
const DEMO_USERS = [
  // ── Admin ──────────────────────────────────────────────────────────────────
  // frontend/src/constants/admin/index.ts → ADMIN_USER
  { firstName: 'Sarah',       lastName: 'Wilson',    email: 'admin@clp.com',           role: 'admin',    status: 'active' },

  // ── Educators ──────────────────────────────────────────────────────────────
  // frontend/src/constants/educator/index.ts → EDUCATOR_USER
  { firstName: 'Angela',      lastName: 'Yu',        email: 'angela@clp.com',          role: 'educator', status: 'active' },
  { firstName: 'Kirill',      lastName: 'Eremenko',  email: 'kirill@clp.com',          role: 'educator', status: 'active' },
  { firstName: 'Sarah',       lastName: 'Chen',      email: 'sarah.chen@clp.com',      role: 'educator', status: 'active' },
  { firstName: 'James',       lastName: 'Wright',    email: 'james.wright@clp.com',    role: 'educator', status: 'active' },

  // ── Learners ───────────────────────────────────────────────────────────────
  // frontend/src/constants/learner/index.ts → MOCK_USER
  { firstName: 'Sopheaktra',  lastName: 'Meng',      email: 'sopheaktra@ayla.edu.kh',  role: 'learner',  status: 'active' },
  // frontend/src/constants/admin/index.ts → ADMIN_USERS rows
  { firstName: 'John',        lastName: 'Doe',       email: 'john@clp.com',            role: 'learner',  status: 'active' },
  { firstName: 'Mike',        lastName: 'Johnson',   email: 'mike@clp.com',            role: 'learner',  status: 'active' },
  { firstName: 'Priya',       lastName: 'Sharma',    email: 'priya@clp.com',           role: 'learner',  status: 'inactive' },
  { firstName: 'Tom',         lastName: 'Chen',      email: 'tom@clp.com',             role: 'learner',  status: 'active' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad(str, len) {
  return str.padEnd(len);
}

function result(skipped, email) {
  const icon = skipped ? '–' : '✔';
  const label = skipped ? 'skipped (exists)' : 'inserted';
  console.log(`  ${icon}  ${pad(email, 36)}  ${label}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const client = new Client(DB);

  console.log(`\nConnecting to ${DB.host}:${DB.port}/${DB.database} …`);
  await client.connect();
  console.log('Connected.\n');

  // 1. Seed roles (idempotent)
  console.log('── Roles ─────────────────────────────────────────────────────');
  for (const [name, id] of Object.entries(ROLES)) {
    await client.query(
      `INSERT INTO "user_roles" (id, role_name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
      [id, name.charAt(0).toUpperCase() + name.slice(1)]
    );
    console.log(`  ✔  ${name}`);
  }

  // 2. Seed demo users
  console.log('\n── Users ─────────────────────────────────────────────────────');
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, salt);

  for (const u of DEMO_USERS) {
    const { rows } = await client.query(
      `SELECT id FROM "users" WHERE email = $1`,
      [u.email]
    );

    if (rows.length > 0) {
      result(true, u.email);
      continue;
    }

    const { rows: inserted } = await client.query(
      `INSERT INTO "users"
         (email, first_name, last_name, password_hash, status, email_verified, provider)
       VALUES ($1, $2, $3, $4, $5, false, 'email')
       RETURNING id`,
      [u.email, u.firstName, u.lastName, passwordHash, u.status]
    );

    const userId = inserted[0].id;

    await client.query(
      `INSERT INTO "user_role_assignments" (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, ROLES[u.role]]
    );

    result(false, u.email);
  }

  await client.end();

  console.log(`
────────────────────────────────────────────────────────────
  Demo seed complete.
  Password for all accounts: ${DEMO_PASSWORD}

  Admin    → admin@clp.com
  Educator → angela@clp.com
  Learner  → sopheaktra@ayla.edu.kh
────────────────────────────────────────────────────────────
`);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});

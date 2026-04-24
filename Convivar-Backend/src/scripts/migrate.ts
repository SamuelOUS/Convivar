import { db } from "../config/database.js";

async function runMigrations(): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      password_hash TEXT NULL,
      provider TEXT NOT NULL CHECK (provider IN ('credentials', 'google')),
      role TEXT NOT NULL CHECK (role IN ('Administrador', 'Coordinador')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_users_email_lower
    ON users (lower(email))
  `);
}

runMigrations()
  .then(() => {
    console.log("Migraciones ejecutadas correctamente.");
  })
  .catch((error: unknown) => {
    console.error("Error ejecutando migraciones:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });

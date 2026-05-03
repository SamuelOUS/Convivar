import { db } from "../config/database.js";
async function runMigrations() {
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
    await db.query(`
    CREATE TABLE IF NOT EXISTS residential_complexes (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      administrator TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Activo', 'En revision')),
      units INTEGER NOT NULL DEFAULT 0 CHECK (units >= 0),
      residents INTEGER NOT NULL DEFAULT 0 CHECK (residents >= 0),
      collection_rate INTEGER NOT NULL DEFAULT 0 CHECK (collection_rate >= 0 AND collection_rate <= 100),
      weekly_reservations INTEGER NOT NULL DEFAULT 0 CHECK (weekly_reservations >= 0),
      open_maintenance INTEGER NOT NULL DEFAULT 0 CHECK (open_maintenance >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
    await db.query(`
    CREATE INDEX IF NOT EXISTS idx_residential_complexes_user_id
    ON residential_complexes (user_id)
  `);
    await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_residential_complexes_user_name_lower
    ON residential_complexes (user_id, lower(name))
  `);
}
runMigrations()
    .then(() => {
    console.log("Migraciones ejecutadas correctamente.");
})
    .catch((error) => {
    console.error("Error ejecutando migraciones:", error);
    process.exitCode = 1;
})
    .finally(async () => {
    await db.end();
});

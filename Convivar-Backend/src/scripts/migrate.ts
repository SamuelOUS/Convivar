import { db } from "../config/database.js";

async function runMigrations(): Promise<void> {
  await db.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

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

  await db.query(`
    CREATE TABLE IF NOT EXISTS residents (
      id UUID PRIMARY KEY,
      residential_complex_id UUID NOT NULL REFERENCES residential_complexes(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      document_number TEXT NULL,
      email TEXT NULL,
      phone TEXT NULL,
      unit_label TEXT NOT NULL,
      resident_type TEXT NOT NULL CHECK (resident_type IN ('Propietario', 'Arrendatario', 'Residente', 'Visitante')),
      status TEXT NOT NULL CHECK (status IN ('Activo', 'Inactivo')),
      imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_residents_complex_id
    ON residents (residential_complex_id)
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_residents_complex_unit
    ON residents (residential_complex_id, unit_label)
  `);

  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_residents_complex_document_lower
    ON residents (residential_complex_id, lower(document_number))
    WHERE document_number IS NOT NULL AND document_number <> ''
  `);

  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_residents_complex_email_lower
    ON residents (residential_complex_id, lower(email))
    WHERE email IS NOT NULL AND email <> ''
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_residents_complex_full_name_lower
    ON residents (residential_complex_id, lower(full_name))
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_residents_complex_document_search
    ON residents (residential_complex_id, document_number)
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_residents_complex_status
    ON residents (residential_complex_id, status)
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_residents_complex_type
    ON residents (residential_complex_id, resident_type)
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_residents_complex_created_at
    ON residents (residential_complex_id, created_at)
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS unit_financial_accounts (
      id UUID PRIMARY KEY,
      residential_complex_id UUID NOT NULL REFERENCES residential_complexes(id) ON DELETE CASCADE,
      unit_label TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT unit_financial_accounts_complex_unit_unique
        UNIQUE (residential_complex_id, unit_label)
    )
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_unit_financial_accounts_complex
    ON unit_financial_accounts (residential_complex_id)
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS financial_movements (
      id UUID PRIMARY KEY,
      account_id UUID NOT NULL REFERENCES unit_financial_accounts(id) ON DELETE CASCADE,
      movement_type TEXT NOT NULL CHECK (movement_type IN ('Cargo', 'Pago', 'Ajuste')),
      concept TEXT NOT NULL,
      amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
      movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
      notes TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_financial_movements_account_date
    ON financial_movements (account_id, movement_date DESC)
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_financial_movements_type
    ON financial_movements (movement_type)
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

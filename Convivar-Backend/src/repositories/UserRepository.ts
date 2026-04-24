import { db } from "../config/database.js";
import type { User } from "../types/auth.types.js";
import type { UserRow } from "../types/db.types.js";

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    passwordHash: row.password_hash,
    provider: row.provider,
    role: row.role,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query<UserRow>(
      `
        SELECT
          id,
          email,
          full_name,
          password_hash,
          provider,
          role,
          created_at,
          updated_at
        FROM users
        WHERE lower(email) = lower($1)
        LIMIT 1
      `,
      [email],
    );

    const row = result.rows[0];
    return row ? mapRowToUser(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await db.query<UserRow>(
      `
        SELECT
          id,
          email,
          full_name,
          password_hash,
          provider,
          role,
          created_at,
          updated_at
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );

    const row = result.rows[0];
    return row ? mapRowToUser(row) : null;
  }

  async save(user: User): Promise<User> {
    const result = await db.query<UserRow>(
      `
        INSERT INTO users (
          id,
          email,
          full_name,
          password_hash,
          provider,
          role,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8::timestamptz)
        RETURNING
          id,
          email,
          full_name,
          password_hash,
          provider,
          role,
          created_at,
          updated_at
      `,
      [
        user.id,
        user.email,
        user.fullName,
        user.passwordHash,
        user.provider,
        user.role,
        user.createdAt,
        user.updatedAt,
      ],
    );

    return mapRowToUser(result.rows[0]);
  }

  async update(user: User): Promise<User> {
    const result = await db.query<UserRow>(
      `
        UPDATE users
        SET
          email = $2,
          full_name = $3,
          password_hash = $4,
          provider = $5,
          role = $6,
          updated_at = $7::timestamptz
        WHERE id = $1
        RETURNING
          id,
          email,
          full_name,
          password_hash,
          provider,
          role,
          created_at,
          updated_at
      `,
      [
        user.id,
        user.email,
        user.fullName,
        user.passwordHash,
        user.provider,
        user.role,
        user.updatedAt,
      ],
    );

    return mapRowToUser(result.rows[0]);
  }
}

import { db } from "../config/database.js";
import type { ResidentialComplexRow } from "../types/db.types.js";
import type {
  ResidentialComplex,
  ResidentialComplexStatus,
} from "../types/residentialComplex.types.js";

function mapRowToResidentialComplex(
  row: ResidentialComplexRow,
): ResidentialComplex {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    address: row.address,
    administrator: row.administrator,
    status: row.status,
    metrics: {
      units: row.units,
      residents: row.residents,
      collectionRate: row.collection_rate,
      weeklyReservations: row.weekly_reservations,
      openMaintenance: row.open_maintenance,
    },
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export type SaveResidentialComplexInput = {
  id: string;
  userId: string;
  name: string;
  address: string;
  administrator: string;
  status: ResidentialComplexStatus;
  units: number;
  residents: number;
  collectionRate: number;
  weeklyReservations: number;
  openMaintenance: number;
  createdAt: string;
  updatedAt: string;
};

export class ResidentialComplexRepository {
  async findByUserId(userId: string): Promise<ResidentialComplex[]> {
    const result = await db.query<ResidentialComplexRow>(
      `
        SELECT
          id,
          user_id,
          name,
          address,
          administrator,
          status,
          units,
          residents,
          collection_rate,
          weekly_reservations,
          open_maintenance,
          created_at,
          updated_at
        FROM residential_complexes
        WHERE user_id = $1
        ORDER BY name ASC
      `,
      [userId],
    );

    return result.rows.map(mapRowToResidentialComplex);
  }

  async findByUserIdAndName(
    userId: string,
    name: string,
  ): Promise<ResidentialComplex | null> {
    const result = await db.query<ResidentialComplexRow>(
      `
        SELECT
          id,
          user_id,
          name,
          address,
          administrator,
          status,
          units,
          residents,
          collection_rate,
          weekly_reservations,
          open_maintenance,
          created_at,
          updated_at
        FROM residential_complexes
        WHERE user_id = $1 AND lower(name) = lower($2)
        LIMIT 1
      `,
      [userId, name],
    );

    const row = result.rows[0];
    return row ? mapRowToResidentialComplex(row) : null;
  }

  async save(input: SaveResidentialComplexInput): Promise<ResidentialComplex> {
    const result = await db.query<ResidentialComplexRow>(
      `
        INSERT INTO residential_complexes (
          id,
          user_id,
          name,
          address,
          administrator,
          status,
          units,
          residents,
          collection_rate,
          weekly_reservations,
          open_maintenance,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12::timestamptz,
          $13::timestamptz
        )
        RETURNING
          id,
          user_id,
          name,
          address,
          administrator,
          status,
          units,
          residents,
          collection_rate,
          weekly_reservations,
          open_maintenance,
          created_at,
          updated_at
      `,
      [
        input.id,
        input.userId,
        input.name,
        input.address,
        input.administrator,
        input.status,
        input.units,
        input.residents,
        input.collectionRate,
        input.weeklyReservations,
        input.openMaintenance,
        input.createdAt,
        input.updatedAt,
      ],
    );

    return mapRowToResidentialComplex(result.rows[0]);
  }
}

import { db } from "../config/database.js";
import type { ResidentRow } from "../types/db.types.js";
import type {
  Resident,
  ResidentListQuery,
  ResidentStats,
  ResidentStatus,
  ResidentType,
} from "../types/resident.types.js";

function mapRowToResident(row: ResidentRow): Resident {
  return {
    id: row.id,
    residentialComplexId: row.residential_complex_id,
    fullName: row.full_name,
    documentNumber: row.document_number,
    email: row.email,
    phone: row.phone,
    unitLabel: row.unit_label,
    residentType: row.resident_type,
    status: row.status,
    importedAt: row.imported_at.toISOString(),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export type SaveResidentInput = {
  id: string;
  residentialComplexId: string;
  fullName: string;
  documentNumber: string | null;
  email: string | null;
  phone: string | null;
  unitLabel: string;
  residentType: ResidentType;
  status: ResidentStatus;
  importedAt: string;
  createdAt: string;
  updatedAt: string;
};

type ResidentFilterOptions = Pick<
  ResidentListQuery,
  | "search"
  | "status"
  | "unitLabel"
  | "residentType"
  | "registeredFrom"
  | "registeredTo"
>;

type ResidentFilterSql = {
  clause: string;
  values: Array<string | number | null>;
};

function buildResidentFilterSql(
  residentialComplexId: string,
  filters: ResidentFilterOptions,
): ResidentFilterSql {
  const clauses = ["residential_complex_id = $1"];
  const values: Array<string | number | null> = [residentialComplexId];

  if (filters.search) {
    values.push(`%${filters.search.toLowerCase()}%`);
    const param = `$${values.length}`;
    clauses.push(`(
      lower(full_name) LIKE ${param}
      OR lower(COALESCE(document_number, '')) LIKE ${param}
      OR lower(COALESCE(email, '')) LIKE ${param}
      OR lower(COALESCE(phone, '')) LIKE ${param}
      OR lower(unit_label) LIKE ${param}
      OR lower(resident_type) LIKE ${param}
      OR lower(status) LIKE ${param}
    )`);
  }

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`status = $${values.length}`);
  }

  if (filters.unitLabel) {
    values.push(`%${filters.unitLabel.toLowerCase()}%`);
    clauses.push(`lower(unit_label) LIKE $${values.length}`);
  }

  if (filters.residentType) {
    values.push(filters.residentType);
    clauses.push(`resident_type = $${values.length}`);
  }

  if (filters.registeredFrom) {
    values.push(filters.registeredFrom);
    clauses.push(`created_at >= $${values.length}::date`);
  }

  if (filters.registeredTo) {
    values.push(filters.registeredTo);
    clauses.push(`created_at < ($${values.length}::date + INTERVAL '1 day')`);
  }

  return {
    clause: clauses.join(" AND "),
    values,
  };
}

export class ResidentRepository {
  async findByComplexId(
    residentialComplexId: string,
    options: ResidentFilterOptions & { limit: number; offset: number },
  ): Promise<Resident[]> {
    const filters = buildResidentFilterSql(residentialComplexId, options);
    const limitParam = filters.values.length + 1;
    const offsetParam = filters.values.length + 2;
    const result = await db.query<ResidentRow>(
      `
        SELECT
          id,
          residential_complex_id,
          full_name,
          document_number,
          email,
          phone,
          unit_label,
          resident_type,
          status,
          imported_at,
          created_at,
          updated_at
        FROM residents
        WHERE ${filters.clause}
        ORDER BY unit_label ASC, full_name ASC
        LIMIT $${limitParam} OFFSET $${offsetParam}
      `,
      [...filters.values, options.limit, options.offset],
    );

    return result.rows.map(mapRowToResident);
  }

  async countByComplexId(
    residentialComplexId: string,
    filters: ResidentFilterOptions = { search: "" },
  ): Promise<number> {
    const filterSql = buildResidentFilterSql(residentialComplexId, filters);
    const result = await db.query<{ total: string }>(
      `
        SELECT COUNT(*) AS total
        FROM residents
        WHERE ${filterSql.clause}
      `,
      filterSql.values,
    );

    return Number(result.rows[0]?.total ?? 0);
  }

  async getStatsByComplexId(residentialComplexId: string): Promise<ResidentStats> {
    const result = await db.query<{
      total: string;
      active: string;
      inactive: string;
      units: string;
      owners: string;
      tenants: string;
      visitors: string;
    }>(
      `
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'Activo') AS active,
          COUNT(*) FILTER (WHERE status = 'Inactivo') AS inactive,
          COUNT(DISTINCT unit_label) AS units,
          COUNT(*) FILTER (WHERE resident_type = 'Propietario') AS owners,
          COUNT(*) FILTER (WHERE resident_type = 'Arrendatario') AS tenants,
          COUNT(*) FILTER (WHERE resident_type = 'Visitante') AS visitors
        FROM residents
        WHERE residential_complex_id = $1
      `,
      [residentialComplexId],
    );

    const row = result.rows[0];

    return {
      total: Number(row?.total ?? 0),
      active: Number(row?.active ?? 0),
      inactive: Number(row?.inactive ?? 0),
      units: Number(row?.units ?? 0),
      owners: Number(row?.owners ?? 0),
      tenants: Number(row?.tenants ?? 0),
      visitors: Number(row?.visitors ?? 0),
    };
  }

  async findExistingIdentity(
    residentialComplexId: string,
    documentNumber: string | null,
    email: string | null,
    excludeResidentId?: string,
  ): Promise<Resident | null> {
    if (!documentNumber && !email) {
      return null;
    }

    const result = await db.query<ResidentRow>(
      `
        SELECT
          id,
          residential_complex_id,
          full_name,
          document_number,
          email,
          phone,
          unit_label,
          resident_type,
          status,
          imported_at,
          created_at,
          updated_at
        FROM residents
        WHERE residential_complex_id = $1
          AND ($4::uuid IS NULL OR id <> $4::uuid)
          AND (
            ($2::text IS NOT NULL AND lower(document_number) = lower($2))
            OR ($3::text IS NOT NULL AND lower(email) = lower($3))
          )
        LIMIT 1
      `,
      [residentialComplexId, documentNumber, email, excludeResidentId ?? null],
    );

    const row = result.rows[0];
    return row ? mapRowToResident(row) : null;
  }

  async findByIdForComplex(
    id: string,
    residentialComplexId: string,
  ): Promise<Resident | null> {
    const result = await db.query<ResidentRow>(
      `
        SELECT
          id,
          residential_complex_id,
          full_name,
          document_number,
          email,
          phone,
          unit_label,
          resident_type,
          status,
          imported_at,
          created_at,
          updated_at
        FROM residents
        WHERE id = $1 AND residential_complex_id = $2
        LIMIT 1
      `,
      [id, residentialComplexId],
    );

    const row = result.rows[0];
    return row ? mapRowToResident(row) : null;
  }

  async save(input: SaveResidentInput): Promise<Resident> {
    const result = await db.query<ResidentRow>(
      `
        INSERT INTO residents (
          id,
          residential_complex_id,
          full_name,
          document_number,
          email,
          phone,
          unit_label,
          resident_type,
          status,
          imported_at,
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
          $10::timestamptz,
          $11::timestamptz,
          $12::timestamptz
        )
        RETURNING
          id,
          residential_complex_id,
          full_name,
          document_number,
          email,
          phone,
          unit_label,
          resident_type,
          status,
          imported_at,
          created_at,
          updated_at
      `,
      [
        input.id,
        input.residentialComplexId,
        input.fullName,
        input.documentNumber,
        input.email,
        input.phone,
        input.unitLabel,
        input.residentType,
        input.status,
        input.importedAt,
        input.createdAt,
        input.updatedAt,
      ],
    );

    return mapRowToResident(result.rows[0]);
  }

  async update(id: string, input: SaveResidentInput): Promise<Resident> {
    const result = await db.query<ResidentRow>(
      `
        UPDATE residents
        SET
          full_name = $2,
          document_number = $3,
          email = $4,
          phone = $5,
          unit_label = $6,
          resident_type = $7,
          status = $8,
          imported_at = $9::timestamptz,
          updated_at = $10::timestamptz
        WHERE id = $1 AND residential_complex_id = $11
        RETURNING
          id,
          residential_complex_id,
          full_name,
          document_number,
          email,
          phone,
          unit_label,
          resident_type,
          status,
          imported_at,
          created_at,
          updated_at
      `,
      [
        id,
        input.fullName,
        input.documentNumber,
        input.email,
        input.phone,
        input.unitLabel,
        input.residentType,
        input.status,
        input.importedAt,
        input.updatedAt,
        input.residentialComplexId,
      ],
    );

    if (!result.rows[0]) {
      throw new Error("No se actualizo ningun residente.");
    }

    return mapRowToResident(result.rows[0]);
  }

  async countAllByComplexId(residentialComplexId: string): Promise<number> {
    return this.countByComplexId(residentialComplexId);
  }
}

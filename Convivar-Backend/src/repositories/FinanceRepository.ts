import { db } from "../config/database.js";
import type {
  FinancialMovementRow,
  UnitFinancialAccountRow,
} from "../types/db.types.js";
import type {
  FinancialMovement,
  FinancialMovementType,
  UnitFinancialAccount,
} from "../types/finance.types.js";

function mapMovement(row: FinancialMovementRow): FinancialMovement {
  return {
    id: row.id,
    accountId: row.account_id,
    movementType: row.movement_type,
    concept: row.concept,
    amount: Number(row.amount),
    movementDate: row.movement_date.toISOString().slice(0, 10),
    notes: row.notes,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

type AccountOverviewRow = UnitFinancialAccountRow & {
  residents: string[] | null;
  charges: string | number;
  payments: string | number;
  balance: string | number;
  last_movement_date: Date | null;
};

export type SaveFinancialMovementInput = {
  id: string;
  accountId: string;
  movementType: FinancialMovementType;
  concept: string;
  amount: number;
  movementDate: string;
  notes: string | null;
};

export class FinanceRepository {
  async syncAccountsFromResidents(residentialComplexId: string): Promise<void> {
    await db.query(
      `
        INSERT INTO unit_financial_accounts (
          id,
          residential_complex_id,
          unit_label,
          created_at,
          updated_at
        )
        SELECT
          gen_random_uuid(),
          residential_complex_id,
          unit_label,
          NOW(),
          NOW()
        FROM residents
        WHERE residential_complex_id = $1
          AND status = 'Activo'
        GROUP BY residential_complex_id, unit_label
        ON CONFLICT (residential_complex_id, unit_label)
        DO UPDATE SET updated_at = NOW()
      `,
      [residentialComplexId],
    );
  }

  async findAccountsByComplexId(
    residentialComplexId: string,
  ): Promise<UnitFinancialAccount[]> {
    const result = await db.query<AccountOverviewRow>(
      `
        WITH resident_names AS (
          SELECT
            residential_complex_id,
            unit_label,
            ARRAY_AGG(full_name ORDER BY full_name ASC) AS residents
          FROM residents
          WHERE residential_complex_id = $1
            AND status = 'Activo'
          GROUP BY residential_complex_id, unit_label
        ),
        movement_totals AS (
          SELECT
            account_id,
            SUM(
              CASE
                WHEN movement_type IN ('Cargo', 'Ajuste')
                THEN amount
                ELSE 0
              END
            ) AS charges,
            SUM(
              CASE
                WHEN movement_type = 'Pago'
                THEN amount
                ELSE 0
              END
            ) AS payments,
            SUM(
              CASE
                WHEN movement_type IN ('Cargo', 'Ajuste')
                THEN amount
                WHEN movement_type = 'Pago'
                THEN -amount
                ELSE 0
              END
            ) AS balance,
            MAX(movement_date) AS last_movement_date
          FROM financial_movements
          GROUP BY account_id
        )
        SELECT
          account.id,
          account.residential_complex_id,
          account.unit_label,
          account.created_at,
          account.updated_at,
          COALESCE(resident_names.residents, '{}') AS residents,
          COALESCE(movement_totals.charges, 0) AS charges,
          COALESCE(movement_totals.payments, 0) AS payments,
          COALESCE(movement_totals.balance, 0) AS balance,
          movement_totals.last_movement_date
        FROM unit_financial_accounts account
        LEFT JOIN resident_names
          ON resident_names.residential_complex_id = account.residential_complex_id
          AND resident_names.unit_label = account.unit_label
        LEFT JOIN movement_totals
          ON movement_totals.account_id = account.id
        WHERE account.residential_complex_id = $1
        ORDER BY account.unit_label ASC
      `,
      [residentialComplexId],
    );

    const movementsByAccount = await this.findMovementsByComplexId(
      residentialComplexId,
    );

    return result.rows.map((row) => {
      const charges = Number(row.charges);
      const payments = Number(row.payments);
      const balance = Number(row.balance);
      const movements = movementsByAccount.get(row.id) ?? [];

      return {
        id: row.id,
        residentialComplexId: row.residential_complex_id,
        unitLabel: row.unit_label,
        residents: row.residents ?? [],
        charges,
        payments,
        balance,
        status:
          balance <= 0 ? "Al dia" : payments > 0 ? "Pendiente" : "En mora",
        lastMovementDate: row.last_movement_date
          ? row.last_movement_date.toISOString().slice(0, 10)
          : null,
        movements,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
      };
    });
  }

  async findAccountByIdForComplex(
    accountId: string,
    residentialComplexId: string,
  ): Promise<UnitFinancialAccountRow | null> {
    const result = await db.query<UnitFinancialAccountRow>(
      `
        SELECT id, residential_complex_id, unit_label, created_at, updated_at
        FROM unit_financial_accounts
        WHERE id = $1 AND residential_complex_id = $2
        LIMIT 1
      `,
      [accountId, residentialComplexId],
    );

    return result.rows[0] ?? null;
  }

  async saveMovement(
    input: SaveFinancialMovementInput,
  ): Promise<FinancialMovement> {
    const result = await db.query<FinancialMovementRow>(
      `
        INSERT INTO financial_movements (
          id,
          account_id,
          movement_type,
          concept,
          amount,
          movement_date,
          notes,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6::date, $7, NOW(), NOW())
        RETURNING
          id,
          account_id,
          movement_type,
          concept,
          amount,
          movement_date,
          notes,
          created_at,
          updated_at
      `,
      [
        input.id,
        input.accountId,
        input.movementType,
        input.concept,
        input.amount,
        input.movementDate,
        input.notes,
      ],
    );

    return mapMovement(result.rows[0]);
  }

  private async findMovementsByComplexId(
    residentialComplexId: string,
  ): Promise<Map<string, FinancialMovement[]>> {
    const result = await db.query<FinancialMovementRow>(
      `
        SELECT
          movement.id,
          movement.account_id,
          movement.movement_type,
          movement.concept,
          movement.amount,
          movement.movement_date,
          movement.notes,
          movement.created_at,
          movement.updated_at
        FROM financial_movements movement
        INNER JOIN unit_financial_accounts account
          ON account.id = movement.account_id
        WHERE account.residential_complex_id = $1
        ORDER BY movement.movement_date DESC, movement.created_at DESC
      `,
      [residentialComplexId],
    );

    return result.rows.reduce<Map<string, FinancialMovement[]>>((map, row) => {
      const movements = map.get(row.account_id) ?? [];
      movements.push(mapMovement(row));
      map.set(row.account_id, movements);
      return map;
    }, new Map());
  }
}

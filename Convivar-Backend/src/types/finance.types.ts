export type FinancialMovementType = "Cargo" | "Pago" | "Ajuste";

export type FinancialAccountStatus = "Al dia" | "Pendiente" | "En mora";

export type FinancialMovement = {
  id: string;
  accountId: string;
  movementType: FinancialMovementType;
  concept: string;
  amount: number;
  movementDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UnitFinancialAccount = {
  id: string;
  residentialComplexId: string;
  unitLabel: string;
  residents: string[];
  charges: number;
  payments: number;
  balance: number;
  status: FinancialAccountStatus;
  lastMovementDate: string | null;
  movements: FinancialMovement[];
  createdAt: string;
  updatedAt: string;
};

export type FinanceSummary = {
  totalUnits: number;
  totalCharges: number;
  totalPayments: number;
  totalBalance: number;
  overdueUnits: number;
  collectionRate: number;
};

export type FinanceOverview = {
  accounts: UnitFinancialAccount[];
  summary: FinanceSummary;
};

export type CreateFinancialMovementRequest = {
  accountId: string;
  movementType: FinancialMovementType;
  concept: string;
  amount: number;
  movementDate?: string;
  notes?: string | null;
};

export type GenerateMonthlyChargesRequest = {
  amount: number;
  concept: string;
  movementDate?: string;
};

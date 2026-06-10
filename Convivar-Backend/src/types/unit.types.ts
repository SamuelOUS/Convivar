import type {
  FinancialAccountStatus,
  UnitFinancialAccount,
} from "./finance.types.js";

export type UnitType = "Apartamento" | "Cuarto util" | "Parqueadero";

export type ManagedUnit = {
  id: string;
  label: string;
  type: UnitType;
  residents: string[];
  financialAccount: UnitFinancialAccount;
};

export type UnitGroup = {
  id: string;
  apartment: ManagedUnit | null;
  associatedUnits: ManagedUnit[];
  totalCharges: number;
  totalPayments: number;
  totalBalance: number;
  status: FinancialAccountStatus;
};

export type UnitSummary = {
  totalUnits: number;
  apartments: number;
  parkingSpaces: number;
  storageRooms: number;
  groupedApartments: number;
  standaloneUnits: number;
  totalBalance: number;
};

export type UnitsOverview = {
  groups: UnitGroup[];
  standaloneUnits: ManagedUnit[];
  summary: UnitSummary;
};

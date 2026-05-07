export type UserRow = {
  id: string;
  email: string;
  full_name: string;
  password_hash: string | null;
  provider: "credentials" | "google";
  role: "Administrador" | "Coordinador";
  created_at: Date;
  updated_at: Date;
};

export type ResidentialComplexRow = {
  id: string;
  user_id: string;
  name: string;
  address: string;
  administrator: string;
  status: "Activo" | "En revision";
  units: number;
  residents: number;
  collection_rate: number;
  weekly_reservations: number;
  open_maintenance: number;
  created_at: Date;
  updated_at: Date;
};

export type ResidentRow = {
  id: string;
  residential_complex_id: string;
  full_name: string;
  document_number: string | null;
  email: string | null;
  phone: string | null;
  unit_label: string;
  resident_type: "Propietario" | "Arrendatario" | "Residente" | "Visitante";
  status: "Activo" | "Inactivo";
  imported_at: Date;
  created_at: Date;
  updated_at: Date;
};

export type UnitFinancialAccountRow = {
  id: string;
  residential_complex_id: string;
  unit_label: string;
  created_at: Date;
  updated_at: Date;
};

export type FinancialMovementRow = {
  id: string;
  account_id: string;
  movement_type: "Cargo" | "Pago" | "Ajuste";
  concept: string;
  amount: number | string;
  movement_date: Date;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

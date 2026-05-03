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

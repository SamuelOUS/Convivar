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

export type ResidentType =
  | "Propietario"
  | "Arrendatario"
  | "Residente"
  | "Visitante";

export type ResidentStatus = "Activo" | "Inactivo";

export type Resident = {
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

export type ImportResidentRequest = {
  fullName: string;
  documentNumber?: string | null;
  email?: string | null;
  phone?: string | null;
  unitLabel: string;
  residentType?: ResidentType;
  status?: ResidentStatus;
};

export type ResidentListQuery = {
  search: string;
  page: number;
  pageSize: number;
  status?: ResidentStatus;
  unitLabel?: string;
  residentType?: ResidentType;
  registeredFrom?: string;
  registeredTo?: string;
};

export type ResidentStats = {
  total: number;
  active: number;
  inactive: number;
  units: number;
  owners: number;
  tenants: number;
  visitors: number;
};

export type ResidentListResult = {
  residents: Resident[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  stats: ResidentStats;
};

export type UpdateResidentRequest = ImportResidentRequest;

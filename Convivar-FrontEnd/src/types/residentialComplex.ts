export type ResidentialComplexMetrics = {
  units: number;
  residents: number;
  collectionRate: number;
  weeklyReservations: number;
  openMaintenance: number;
};

export type ResidentialComplex = {
  id: string;
  userId?: string;
  name: string;
  address: string;
  administrator: string;
  status: "Activo" | "En revision";
  metrics: ResidentialComplexMetrics;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateResidentialComplexData = {
  name: string;
  address: string;
  administrator: string;
  status: "Activo" | "En revision";
  units: number;
  residents: number;
  collectionRate: number;
  weeklyReservations: number;
  openMaintenance: number;
};

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

export type ImportResidentData = {
  fullName: string;
  documentNumber?: string | null;
  email?: string | null;
  phone?: string | null;
  unitLabel: string;
  residentType?: ResidentType;
  status?: ResidentStatus;
};

export type UpdateResidentData = Required<ImportResidentData>;

export type ResidentPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ResidentFilters = {
  status: "" | ResidentStatus;
  unitLabel: string;
  residentType: "" | ResidentType;
  registeredFrom: string;
  registeredTo: string;
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

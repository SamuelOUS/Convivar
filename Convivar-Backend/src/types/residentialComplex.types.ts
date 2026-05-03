export type ResidentialComplexStatus = "Activo" | "En revision";

export type ResidentialComplexMetrics = {
  units: number;
  residents: number;
  collectionRate: number;
  weeklyReservations: number;
  openMaintenance: number;
};

export type ResidentialComplex = {
  id: string;
  userId: string;
  name: string;
  address: string;
  administrator: string;
  status: ResidentialComplexStatus;
  metrics: ResidentialComplexMetrics;
  createdAt: string;
  updatedAt: string;
};

export type CreateResidentialComplexRequest = {
  name: string;
  address: string;
  administrator: string;
  status?: ResidentialComplexStatus;
  units?: number;
  residents?: number;
  collectionRate?: number;
  weeklyReservations?: number;
  openMaintenance?: number;
};

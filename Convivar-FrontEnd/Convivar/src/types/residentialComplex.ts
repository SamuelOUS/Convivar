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

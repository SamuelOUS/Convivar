import type { ResidentialComplex } from "../../types/residentialComplex";

export const residentialComplexes: ResidentialComplex[] = [
  {
    id: "bosques-del-rio",
    name: "Bosques del Rio",
    address: "Carrera 18 #72-40",
    administrator: "Administracion Norte",
    status: "Activo",
    metrics: {
      units: 142,
      residents: 318,
      collectionRate: 94,
      weeklyReservations: 26,
      openMaintenance: 11,
    },
  },
  {
    id: "altos-de-la-sabana",
    name: "Altos de la Sabana",
    address: "Calle 9 #31-18",
    administrator: "Gestion Sabana",
    status: "Activo",
    metrics: {
      units: 96,
      residents: 211,
      collectionRate: 88,
      weeklyReservations: 14,
      openMaintenance: 7,
    },
  },
  {
    id: "senderos-de-monteverde",
    name: "Senderos de Monteverde",
    address: "Avenida 6 #45-12",
    administrator: "Equipo Monteverde",
    status: "En revision",
    metrics: {
      units: 184,
      residents: 402,
      collectionRate: 91,
      weeklyReservations: 32,
      openMaintenance: 18,
    },
  },
];

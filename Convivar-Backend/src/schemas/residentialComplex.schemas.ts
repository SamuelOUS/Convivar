import { z } from "zod";

export const createResidentialComplexSchema = z.object({
  name: z.string().trim().min(3),
  address: z.string().trim().min(5),
  administrator: z.string().trim().min(3),
  status: z.enum(["Activo", "En revision"]).default("Activo"),
  units: z.number().int().min(0).default(0),
  residents: z.number().int().min(0).default(0),
  collectionRate: z.number().int().min(0).max(100).default(0),
  weeklyReservations: z.number().int().min(0).default(0),
  openMaintenance: z.number().int().min(0).default(0),
});

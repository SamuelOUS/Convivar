import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

export const importResidentSchema = z.object({
  fullName: z.string().trim().min(3),
  documentNumber: optionalText,
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .nullable()
    .transform((value) => (value ? value.toLowerCase() : null)),
  phone: optionalText,
  unitLabel: z.string().trim().min(1),
  residentType: z
    .enum(["Propietario", "Arrendatario", "Residente", "Visitante"])
    .default("Residente"),
  status: z.enum(["Activo", "Inactivo"]).default("Activo"),
});

export const importResidentsSchema = z.object({
  residents: z.array(importResidentSchema).min(1).max(2000),
});

export const residentListQuerySchema = z.object({
  search: z.string().trim().default(""),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(10),
  status: z.enum(["Activo", "Inactivo"]).optional(),
  unitLabel: z.string().trim().optional(),
  residentType: z
    .enum(["Propietario", "Arrendatario", "Residente", "Visitante"])
    .optional(),
  registeredFrom: z.string().trim().date().optional(),
  registeredTo: z.string().trim().date().optional(),
});

export const updateResidentSchema = importResidentSchema;

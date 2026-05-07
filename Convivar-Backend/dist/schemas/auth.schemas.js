import { z } from "zod";
export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
    rememberSession: z.boolean().default(true),
});
export const registerSchema = z
    .object({
    fullName: z.string().min(4),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    acceptTerms: z.literal(true),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmPassword"],
});
export const googleAuthSchema = z.object({
    credential: z.string().min(1),
    selectBy: z.string().optional(),
});

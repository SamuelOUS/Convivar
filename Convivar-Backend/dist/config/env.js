import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const envSchema = z.object({
    PORT: z.coerce.number().default(4000),
    FRONTEND_URL: z.string().url().default("http://127.0.0.1:5173"),
    JWT_SECRET: z.string().min(10),
    GOOGLE_CLIENT_ID: z.string().min(10).optional(),
    DATABASE_URL: z.string().min(1),
});
export const env = envSchema.parse(process.env);

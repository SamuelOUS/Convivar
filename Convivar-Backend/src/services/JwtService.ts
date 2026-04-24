import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthTokenPayload } from "../types/auth.types.js";
import { AppError } from "../errors/AppError.js";

export class JwtService {
  sign(payload: AuthTokenPayload, rememberSession: boolean): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: rememberSession ? "7d" : "1d",
    });
  }

  verify(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    } catch {
      throw new AppError("La sesion no es valida o ya expiro.", 401);
    }
  }
}

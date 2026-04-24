import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
export class JwtService {
    sign(payload, rememberSession) {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: rememberSession ? "7d" : "1d",
        });
    }
    verify(token) {
        try {
            return jwt.verify(token, env.JWT_SECRET);
        }
        catch {
            throw new AppError("La sesion no es valida o ya expiro.", 401);
        }
    }
}

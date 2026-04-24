import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import type { AuthTokenPayload } from "../types/auth.types.js";
import { JwtService } from "../services/JwtService.js";

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthTokenPayload;
  }
}

const jwtService = new JwtService();

export function authenticateRequest(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    next(new AppError("No se envio un token de autorizacion valido.", 401));
    return;
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();
  request.auth = jwtService.verify(token);
  next();
}

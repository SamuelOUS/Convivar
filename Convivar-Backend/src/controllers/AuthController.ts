import type { Request, Response } from "express";
import type { z } from "zod";
import { AuthService } from "../services/AuthService.js";
import {
  googleAuthSchema,
  loginSchema,
  registerSchema,
} from "../schemas/auth.schemas.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (request: Request, response: Response): Promise<void> => {
    const payload = this.parseBody(loginSchema, request.body);
    const session = await this.authService.login(payload);
    response.status(200).json(session);
  };

  register = async (request: Request, response: Response): Promise<void> => {
    const payload = this.parseBody(registerSchema, request.body);
    const session = await this.authService.register(payload);
    response.status(201).json(session);
  };

  googleLogin = async (request: Request, response: Response): Promise<void> => {
    const payload = this.parseBody(googleAuthSchema, request.body);
    const session = await this.authService.authenticateWithGoogle(payload);
    response.status(200).json(session);
  };

  me = async (request: Request, response: Response): Promise<void> => {
    if (!request.auth) {
      response.status(401).json({ message: "No se encontro sesion activa." });
      return;
    }

    response.status(200).json({
      user: {
        email: request.auth.email,
        fullName: request.auth.fullName,
        provider: request.auth.provider,
        role: request.auth.role,
      },
    });
  };

  private parseBody<TSchema extends z.ZodTypeAny>(
    schema: TSchema,
    body: unknown,
  ): z.infer<TSchema> {
    return schema.parse(body);
  }
}

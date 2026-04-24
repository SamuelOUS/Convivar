import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import type { GoogleTokenPayload } from "../types/google.types.js";

export class GoogleTokenVerifier {
  private readonly client = env.GOOGLE_CLIENT_ID
    ? new OAuth2Client(env.GOOGLE_CLIENT_ID)
    : null;

  async verifyIdToken(credential: string): Promise<GoogleTokenPayload> {
    if (!env.GOOGLE_CLIENT_ID || !this.client) {
      throw new AppError(
        "Google no esta configurado en el backend. Define GOOGLE_CLIENT_ID.",
        503,
      );
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      return ticket.getPayload() ?? {};
    } catch {
      throw new AppError("No fue posible validar la cuenta de Google.", 401);
    }
  }
}

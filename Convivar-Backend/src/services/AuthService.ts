import { AppError } from "../errors/AppError.js";
import type {
  AuthSession,
  GoogleAuthRequest,
  LoginRequest,
  PublicUser,
  RegisterRequest,
  User,
} from "../types/auth.types.js";
import { createId } from "../utils/id.utils.js";
import { nowIsoString } from "../utils/date.utils.js";
import { JwtService } from "./JwtService.js";
import { PasswordService } from "./PasswordService.js";
import { GoogleTokenVerifier } from "./GoogleTokenVerifier.js";
import { UserRepository } from "../repositories/UserRepository.js";

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly googleTokenVerifier: GoogleTokenVerifier,
  ) {}

  async login(payload: LoginRequest): Promise<AuthSession> {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user || !user.passwordHash) {
      throw new AppError("Credenciales invalidas.", 401);
    }

    const isPasswordValid = await this.passwordService.compare(
      payload.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new AppError("Credenciales invalidas.", 401);
    }

    return this.createSession(user, payload.rememberSession);
  }

  async register(payload: RegisterRequest): Promise<AuthSession> {
    const existingUser = await this.userRepository.findByEmail(payload.email);

    if (existingUser) {
      throw new AppError("Ya existe una cuenta registrada con este correo.", 409);
    }

    const timestamp = nowIsoString();
    const passwordHash = await this.passwordService.hash(payload.password);
    const user: User = {
      id: createId(),
      email: payload.email.trim().toLowerCase(),
      fullName: payload.fullName.trim(),
      passwordHash,
      provider: "credentials",
      role: "Coordinador",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.userRepository.save(user);
    return this.createSession(user, true);
  }

  async authenticateWithGoogle(payload: GoogleAuthRequest): Promise<AuthSession> {
    const googleUser = await this.googleTokenVerifier.verifyIdToken(payload.credential);
    const email = googleUser.email?.trim().toLowerCase();

    if (!email || !googleUser.name || !googleUser.sub) {
      throw new AppError("Google no devolvio los datos minimos esperados.", 400);
    }

    if (googleUser.email_verified === false) {
      throw new AppError("La cuenta de Google debe tener correo verificado.", 400);
    }

    const existingUser = await this.userRepository.findByEmail(email);
    const timestamp = nowIsoString();

    if (existingUser) {
      const updatedUser: User = {
        ...existingUser,
        fullName: googleUser.name,
        provider: "google",
        passwordHash: existingUser.passwordHash,
        updatedAt: timestamp,
      };

      await this.userRepository.update(updatedUser);
      return this.createSession(updatedUser, true);
    }

    const nextUser: User = {
      id: createId(),
      email,
      fullName: googleUser.name,
      passwordHash: null,
      provider: "google",
      role: "Coordinador",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.userRepository.save(nextUser);
    return this.createSession(nextUser, true);
  }

  private createSession(user: User, rememberSession: boolean): AuthSession {
    const token = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        provider: user.provider,
      },
      rememberSession,
    );

    return {
      token,
      user: this.toPublicUser(user),
    };
  }

  private toPublicUser(user: User): PublicUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }
}

export type AuthProvider = "credentials" | "google";

export type UserRole = "Administrador" | "Coordinador";

export type User = {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string | null;
  provider: AuthProvider;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  fullName: string;
};

export type AuthSession = {
  token: string;
  user: {
    email: string;
    fullName: string;
    provider: AuthProvider;
    role: UserRole;
  };
};

export type LoginRequest = {
  email: string;
  password: string;
  rememberSession: boolean;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export type GoogleAuthRequest = {
  credential: string;
  selectBy?: string;
};

export type AuthProvider = "credentials" | "google";

export type AuthUser = {
  email: string;
  fullName: string;
  role: string;
  provider: AuthProvider;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type LoginCredentials = {
  email: string;
  password: string;
  rememberSession: boolean;
};

export type RegisterData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export type StoredUser = AuthUser & {
  password: string;
};

export type GoogleAuthPayload = {
  credential: string;
  selectBy?: string;
};

export type LoginValidationErrors = Partial<Record<keyof LoginCredentials, string>>;

export type RegisterValidationErrors = Partial<Record<keyof RegisterData, string>>;

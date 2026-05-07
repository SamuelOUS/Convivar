import { createContext } from "react";
import type {
  AuthUser,
  GoogleAuthPayload,
  LoginCredentials,
  RegisterData,
} from "../types/auth";

export type AuthContextValue = {
  authToken: string | null;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<void>;
  registerWithGoogle: (payload: GoogleAuthPayload) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

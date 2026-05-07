import { useEffect, useState, type PropsWithChildren } from "react";
import {
  AuthContext,
  type AuthContextValue,
} from "./AuthContextDefinition";
import {
  clearSession,
  loadSession,
  persistSession,
} from "../services/auth/authStorage";
import * as authService from "../services/auth/authService";
import type {
  AuthSession,
  GoogleAuthPayload,
  LoginCredentials,
  RegisterData,
} from "../types/auth";

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const [isBootstrapping, setIsBootstrapping] = useState(
    () => Boolean(loadSession()?.token),
  );

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    void authService
      .getCurrentSession(session.token)
      .then((response) => {
        const nextSession: AuthSession = {
          token: session.token,
          user: response.user,
        };

        persistSession(nextSession, { rememberSession: true });
        setSession(nextSession);
      })
      .catch(() => {
        clearSession();
        setSession(null);
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, [session?.token]);

  async function handleLogin(credentials: LoginCredentials): Promise<void> {
    const nextSession = await authService.login(credentials);
    persistSession(nextSession, { rememberSession: credentials.rememberSession });
    setSession(nextSession);
  }

  async function handleRegister(data: RegisterData): Promise<void> {
    const nextSession = await authService.register(data);
    persistSession(nextSession, { rememberSession: true });
    setSession(nextSession);
  }

  async function handleGoogleLogin(payload: GoogleAuthPayload): Promise<void> {
    const nextSession = await authService.loginWithGoogle(payload);
    persistSession(nextSession, { rememberSession: true });
    setSession(nextSession);
  }

  async function handleGoogleRegister(payload: GoogleAuthPayload): Promise<void> {
    const nextSession = await authService.registerWithGoogle(payload);
    persistSession(nextSession, { rememberSession: true });
    setSession(nextSession);
  }

  function handleLogout(): void {
    authService.logout();
    clearSession();
    setSession(null);
  }

  const value: AuthContextValue = {
    authToken: session?.token ?? null,
    currentUser: session?.user ?? null,
    isAuthenticated: Boolean(session),
    isBootstrapping,
    login: handleLogin,
    register: handleRegister,
    loginWithGoogle: handleGoogleLogin,
    registerWithGoogle: handleGoogleRegister,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

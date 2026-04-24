import type { GoogleAuthPayload, LoginCredentials, RegisterData } from "../../types/auth";
import { request } from "../api/apiClient";
import type { AuthSession } from "../../types/auth";

export function login(credentials: LoginCredentials) {
  return request<AuthSession>("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function register(data: RegisterData) {
  return request<AuthSession>("/auth/register", {
    method: "POST",
    body: data,
  });
}

export function loginWithGoogle(payload?: GoogleAuthPayload) {
  if (!payload) {
    throw new Error("No se recibio la credencial de Google.");
  }

  return request<AuthSession>("/auth/google", {
    method: "POST",
    body: payload,
  });
}

export function registerWithGoogle(payload?: GoogleAuthPayload) {
  if (!payload) {
    throw new Error("No se recibio la credencial de Google.");
  }

  return request<AuthSession>("/auth/google", {
    method: "POST",
    body: payload,
  });
}

export function getCurrentSession(token: string) {
  return request<{ user: AuthSession["user"] }>("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function logout() {
  return;
}

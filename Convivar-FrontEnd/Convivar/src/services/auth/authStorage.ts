import type { AuthSession } from "../../types/auth";

const LOCAL_SESSION_STORAGE_KEY = "convivar.auth.session.local";
const SESSION_STORAGE_KEY = "convivar.auth.session.session";

function readJSON<T>(storage: Storage, storageKey: string): T | null {
  try {
    const rawValue = storage.getItem(storageKey);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    storage.removeItem(storageKey);
    return null;
  }
}

export function loadSession(): AuthSession | null {
  return (
    readJSON<AuthSession>(window.sessionStorage, SESSION_STORAGE_KEY) ??
    readJSON<AuthSession>(window.localStorage, LOCAL_SESSION_STORAGE_KEY)
  );
}

export function persistSession(
  session: AuthSession,
  options?: { rememberSession?: boolean },
): void {
  clearSession();

  if (options?.rememberSession) {
    window.localStorage.setItem(LOCAL_SESSION_STORAGE_KEY, JSON.stringify(session));
    return;
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  window.localStorage.removeItem(LOCAL_SESSION_STORAGE_KEY);
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export const demoCredentials = {
  email: "admin@convivar.com",
  password: "Convivar2026!",
  rememberSession: true,
};

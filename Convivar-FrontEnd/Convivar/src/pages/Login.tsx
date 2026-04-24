import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthShell, LoginForm } from "../components/auth";
import { useAuth } from "../hooks/useAuth";
import type { GoogleAuthPayload, LoginCredentials } from "../types/auth";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function redirectAfterAuth(): void {
    const targetPath = (location.state as { from?: { pathname?: string } } | null)
      ?.from?.pathname;
    navigate(targetPath ?? "/", { replace: true });
  }

  async function handleLogin(credentials: LoginCredentials): Promise<void> {
    setIsSubmitting(true);

    try {
      await login(credentials);
      redirectAfterAuth();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin(payload: GoogleAuthPayload): Promise<void> {
    try {
      await loginWithGoogle(payload);
      redirectAfterAuth();
    } finally {
      // GIS maneja el popup; no necesitamos un loader manual persistente aqui.
    }
  }

  return (
    <AuthShell
      badge="Convivar ERP"
      description="Un acceso pensado para equipos administrativos que necesitan visibilidad clara, tareas ordenadas y un flujo confiable de trabajo."
      title="Administra la operacion del conjunto desde un solo lugar."
    >
      <LoginForm
        onGoogleSubmit={handleGoogleLogin}
        onSubmit={handleLogin}
        isSubmitting={isSubmitting}
      />
    </AuthShell>
  );
}

export default Login;

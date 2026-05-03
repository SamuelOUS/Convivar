import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell, RegisterForm } from "../components/auth";
import { useAuth } from "../hooks/useAuth";
import type { GoogleAuthPayload, RegisterData } from "../types/auth";

function Register() {
  const navigate = useNavigate();
  const { register, registerWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister(data: RegisterData): Promise<void> {
    setIsSubmitting(true);

    try {
      await register(data);
      navigate("/conjuntos", { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleRegister(payload: GoogleAuthPayload): Promise<void> {
    try {
      await registerWithGoogle(payload);
      navigate("/conjuntos", { replace: true });
    } finally {
      // GIS maneja el popup y el retorno de la credencial.
    }
  }

  return (
    <AuthShell
      badge="Nuevo acceso"
      description="Prepara nuevos accesos administrativos sin duplicar reglas de validacion ni mezclar UI con persistencia."
      title="Crea usuarios con una base lista para crecer."
    >
      <RegisterForm
        onGoogleSubmit={handleGoogleRegister}
        onSubmit={handleRegister}
        isSubmitting={isSubmitting}
      />
    </AuthShell>
  );
}

export default Register;

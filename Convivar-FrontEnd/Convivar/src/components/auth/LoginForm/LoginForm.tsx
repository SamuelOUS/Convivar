import { useState, type ChangeEvent, type FormEvent } from "react";
import { demoCredentials } from "../../../services/auth/authStorage";
import type {
  GoogleAuthPayload,
  LoginCredentials,
  LoginValidationErrors,
} from "../../../types/auth";
import { validateLogin } from "../../../utils/authValidation";
import { AuthCheckbox } from "../AuthCheckbox";
import { AuthDivider } from "../AuthDivider";
import { AuthField } from "../AuthField";
import { AuthRedirectPrompt } from "../AuthRedirectPrompt";
import { AuthStatusMessage } from "../AuthStatusMessage";
import { SocialAuthButton } from "../SocialAuthButton";
import styles from "./LoginForm.module.css";

type LoginFormProps = {
  onGoogleSubmit: (payload: GoogleAuthPayload) => Promise<void>;
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  isSubmitting: boolean;
};

const initialState: LoginCredentials = {
  email: "",
  password: "",
  rememberSession: true,
};

function LoginForm({
  isSubmitting,
  onGoogleSubmit,
  onSubmit,
}: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>(initialState);
  const [errors, setErrors] = useState<LoginValidationErrors>({});
  const [submitError, setSubmitError] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const { checked, name, type, value } = event.target;

    setCredentials((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));

    setSubmitError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const validationErrors = validateLogin(credentials);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(credentials);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesion. Intenta nuevamente.",
      );
    }
  }

  async function handleGoogleCredential(
    response: GoogleCredentialResponse,
  ): Promise<void> {
    setSubmitError("");

    try {
      await onGoogleSubmit({
        credential: response.credential,
        selectBy: response.select_by,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesion con Google.",
      );
    }
  }

  function fillDemoCredentials(): void {
    setCredentials(demoCredentials);
    setErrors({});
    setSubmitError("");
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Acceso seguro</p>
        <h2 className={styles.title}>Inicia sesion en Convivar</h2>
        <p className={styles.subtitle}>
          Accede al panel administrativo con correo, contrasena o Google.
        </p>
      </div>

      <div className={styles.demoCard}>
        <p className={styles.demoTitle}>Credenciales demo</p>
        <p className={styles.demoLine}>
          Usuario: <strong>{demoCredentials.email}</strong>
        </p>
        <p className={styles.demoLine}>
          Clave: <strong>{demoCredentials.password}</strong>
        </p>
        <button className={styles.secondaryButton} onClick={fillDemoCredentials} type="button">
          Usar credenciales de prueba
        </button>
      </div>

      <SocialAuthButton mode="login" onCredential={handleGoogleCredential} />

      <AuthDivider label="o inicia con tu cuenta" />

      <AuthField
        autoComplete="email"
        error={errors.email}
        id="login-email"
        label="Correo electronico"
        name="email"
        onChange={handleChange}
        placeholder="admin@convivar.com"
        type="email"
        value={credentials.email}
      />

      <AuthField
        autoComplete="current-password"
        error={errors.password}
        hint="Si luego llega un backend real, este campo ya esta listo para conectarse al endpoint de login."
        id="login-password"
        label="Contrasena"
        name="password"
        onChange={handleChange}
        placeholder="Ingresa tu contrasena"
        type="password"
        value={credentials.password}
      />

      <div className={styles.utilityRow}>
        <AuthCheckbox
          checked={credentials.rememberSession}
          id="login-rememberSession"
          label="Mantener sesion iniciada"
          name="rememberSession"
          onChange={handleChange}
        />
        <button className={styles.inlineLink} type="button">
          Olvide mi contrasena
        </button>
      </div>

      {submitError ? <AuthStatusMessage message={submitError} /> : null}

      <button className={styles.submitButton} disabled={isSubmitting} type="submit">
        {isSubmitting ? "Validando..." : "Entrar al panel"}
      </button>

      <AuthRedirectPrompt
        ctaLabel="Crear cuenta"
        text="Aun no tienes cuenta?"
        to="/registro"
      />
    </form>
  );
}

export default LoginForm;

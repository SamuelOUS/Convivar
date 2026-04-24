import { useState, type ChangeEvent, type FormEvent } from "react";
import type {
  GoogleAuthPayload,
  RegisterData,
  RegisterValidationErrors,
} from "../../../types/auth";
import { validateRegister } from "../../../utils/authValidation";
import { AuthCheckbox } from "../AuthCheckbox";
import { AuthDivider } from "../AuthDivider";
import { AuthField } from "../AuthField";
import { AuthRedirectPrompt } from "../AuthRedirectPrompt";
import { AuthStatusMessage } from "../AuthStatusMessage";
import { SocialAuthButton } from "../SocialAuthButton";
import styles from "./RegisterForm.module.css";

type RegisterFormProps = {
  onGoogleSubmit: (payload: GoogleAuthPayload) => Promise<void>;
  onSubmit: (data: RegisterData) => Promise<void>;
  isSubmitting: boolean;
};

const initialState: RegisterData = {
  acceptTerms: false,
  confirmPassword: "",
  email: "",
  fullName: "",
  password: "",
};

function RegisterForm({
  isSubmitting,
  onGoogleSubmit,
  onSubmit,
}: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData>(initialState);
  const [errors, setErrors] = useState<RegisterValidationErrors>({});
  const [submitError, setSubmitError] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const { checked, name, type, value } = event.target;

    setFormData((current) => ({
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

    const validationErrors = validateRegister(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No fue posible crear la cuenta. Intenta nuevamente.",
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
          : "No fue posible registrarte con Google.",
      );
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Nuevo acceso</p>
        <h2 className={styles.title}>Crea tu cuenta</h2>
        <p className={styles.subtitle}>
          Registra un nuevo usuario administrativo o continua con Google.
        </p>
      </div>

      <SocialAuthButton mode="register" onCredential={handleGoogleCredential} />

      <AuthDivider label="o crea tu cuenta manualmente" />

      <AuthField
        error={errors.fullName}
        id="register-fullName"
        label="Nombre completo"
        name="fullName"
        onChange={handleChange}
        placeholder="Nombre del responsable"
        type="text"
        value={formData.fullName}
      />

      <AuthField
        autoComplete="email"
        error={errors.email}
        id="register-email"
        label="Correo electronico"
        name="email"
        onChange={handleChange}
        placeholder="coordinacion@convivar.com"
        type="email"
        value={formData.email}
      />

      <AuthField
        autoComplete="new-password"
        error={errors.password}
        hint="Usa minimo 8 caracteres. Este mock ya deja listo el contrato para una futura integracion con backend."
        id="register-password"
        label="Contrasena"
        name="password"
        onChange={handleChange}
        placeholder="Crea una contrasena"
        type="password"
        value={formData.password}
      />

      <AuthField
        autoComplete="new-password"
        error={errors.confirmPassword}
        id="register-confirmPassword"
        label="Confirmar contrasena"
        name="confirmPassword"
        onChange={handleChange}
        placeholder="Repite la contrasena"
        type="password"
        value={formData.confirmPassword}
      />

      <AuthCheckbox
        checked={formData.acceptTerms}
        error={errors.acceptTerms}
        id="register-acceptTerms"
        label="Acepto terminos, tratamiento de datos y creacion de acceso administrativo."
        name="acceptTerms"
        onChange={handleChange}
      />

      {submitError ? <AuthStatusMessage message={submitError} /> : null}

      <button className={styles.submitButton} disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <AuthRedirectPrompt
        ctaLabel="Iniciar sesion"
        text="Ya tienes cuenta?"
        to="/login"
      />
    </form>
  );
}

export default RegisterForm;

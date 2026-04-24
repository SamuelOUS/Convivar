import type {
  LoginCredentials,
  LoginValidationErrors,
  RegisterData,
  RegisterValidationErrors,
} from "../types/auth";

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

export function validateLogin(
  credentials: LoginCredentials,
): LoginValidationErrors {
  const errors: LoginValidationErrors = {};

  if (!credentials.email.trim()) {
    errors.email = "El correo es obligatorio.";
  } else if (!EMAIL_PATTERN.test(credentials.email.trim())) {
    errors.email = "Ingresa un correo valido.";
  }

  if (!credentials.password) {
    errors.password = "La contrasena es obligatoria.";
  }

  return errors;
}

export function validateRegister(data: RegisterData): RegisterValidationErrors {
  const errors: RegisterValidationErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = "El nombre completo es obligatorio.";
  } else if (data.fullName.trim().length < 4) {
    errors.fullName = "Ingresa un nombre mas descriptivo.";
  }

  if (!data.email.trim()) {
    errors.email = "El correo es obligatorio.";
  } else if (!EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = "Ingresa un correo valido.";
  }

  if (!data.password) {
    errors.password = "La contrasena es obligatoria.";
  } else if (data.password.length < 8) {
    errors.password = "La contrasena debe tener al menos 8 caracteres.";
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Debes confirmar la contrasena.";
  } else if (data.confirmPassword !== data.password) {
    errors.confirmPassword = "Las contrasenas no coinciden.";
  }

  if (!data.acceptTerms) {
    errors.acceptTerms = "Debes aceptar los terminos para continuar.";
  }

  return errors;
}

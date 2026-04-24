import type { InputHTMLAttributes } from "react";
import styles from "./AuthField.module.css";

type AuthFieldProps = {
  error?: string;
  hint?: string;
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

function AuthField({ error, hint, id, label, ...inputProps }: AuthFieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={styles.field} htmlFor={id}>
      <span className={styles.label}>{label}</span>
      <input
        aria-describedby={describedBy || undefined}
        aria-invalid={Boolean(error)}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        id={id}
        {...inputProps}
      />
      {hint ? (
        <span className={styles.hint} id={`${id}-hint`}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className={styles.errorMessage} id={`${id}-error`} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export default AuthField;

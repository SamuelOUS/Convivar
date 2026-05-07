import type { InputHTMLAttributes } from "react";
import styles from "./AuthCheckbox.module.css";

type AuthCheckboxProps = {
  error?: string;
  label: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

function AuthCheckbox({ error, id, label, ...inputProps }: AuthCheckboxProps) {
  return (
    <label className={styles.wrapper} htmlFor={id}>
      <span className={styles.control}>
        <input className={styles.input} id={id} type="checkbox" {...inputProps} />
        <span className={styles.label}>{label}</span>
      </span>
      {error ? (
        <span className={styles.errorMessage} id={`${id}-error`} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export default AuthCheckbox;

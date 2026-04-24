import styles from "./AuthDivider.module.css";

type AuthDividerProps = {
  label: string;
};

function AuthDivider({ label }: AuthDividerProps) {
  return (
    <div className={styles.divider}>
      <span>{label}</span>
    </div>
  );
}

export default AuthDivider;

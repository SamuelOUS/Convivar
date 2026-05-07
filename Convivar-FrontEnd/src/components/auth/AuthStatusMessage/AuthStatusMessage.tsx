import styles from "./AuthStatusMessage.module.css";

type AuthStatusMessageProps = {
  message: string;
};

function AuthStatusMessage({ message }: AuthStatusMessageProps) {
  return (
    <div className={styles.message} role="alert">
      {message}
    </div>
  );
}

export default AuthStatusMessage;

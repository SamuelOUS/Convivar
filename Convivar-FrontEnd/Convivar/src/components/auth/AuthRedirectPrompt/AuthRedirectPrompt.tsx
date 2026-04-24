import { Link } from "react-router-dom";
import styles from "./AuthRedirectPrompt.module.css";

type AuthRedirectPromptProps = {
  ctaLabel: string;
  text: string;
  to: string;
};

function AuthRedirectPrompt({
  ctaLabel,
  text,
  to,
}: AuthRedirectPromptProps) {
  return (
    <p className={styles.prompt}>
      {text} <Link to={to}>{ctaLabel}</Link>
    </p>
  );
}

export default AuthRedirectPrompt;

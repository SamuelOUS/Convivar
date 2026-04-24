import { useEffect, useId, useRef, useState } from "react";
import styles from "./SocialAuthButton.module.css";

type SocialAuthButtonProps = {
  mode: "login" | "register";
  onCredential: (response: GoogleCredentialResponse) => void | Promise<void>;
};

function SocialAuthButton({
  mode,
  onCredential,
}: SocialAuthButtonProps) {
  const containerId = useId();
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const missingClientIdMessage = !googleClientId
    ? "Configura VITE_GOOGLE_CLIENT_ID para habilitar el acceso real con Google."
    : "";
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    let isMounted = true;

    function renderGoogleButton(): void {
      if (!isMounted || !buttonContainerRef.current || !window.google) {
        return;
      }

      buttonContainerRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          void onCredential(response);
        },
        ux_mode: "popup",
      });

      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: mode === "register" ? "signup_with" : "signin_with",
        logo_alignment: "left",
        width: "320",
      });
    }

    if (window.google) {
      renderGoogleButton();
      return () => {
        isMounted = false;
      };
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", renderGoogleButton, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = renderGoogleButton;
      script.onerror = () => {
        if (isMounted) {
          setErrorMessage("No fue posible cargar Google Identity Services.");
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
    };
  }, [googleClientId, mode, onCredential]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.button} id={containerId} ref={buttonContainerRef} />
      {missingClientIdMessage || errorMessage ? (
        <p className={styles.errorMessage}>{missingClientIdMessage || errorMessage}</p>
      ) : null}
    </div>
  );
}

export default SocialAuthButton;

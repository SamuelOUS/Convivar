import type { PropsWithChildren } from "react";
import styles from "./AuthShell.module.css";

type AuthShellProps = PropsWithChildren & {
  badge: string;
  description: string;
  title: string;
};

function AuthShell({
  badge,
  children,
  description,
  title,
}: AuthShellProps) {
  return (
    <div className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brandCopy}>
          <p className={styles.badge}>{badge}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.featureGrid}>
          <article className={styles.featureCard}>
            <h2>Google real, backend pendiente</h2>
            <p>
              El acceso con credenciales sigue en mock, pero Google ya usa
              Google Identity Services y entrega el ID token real del usuario.
            </p>
          </article>
          <article className={styles.featureCard}>
            <h2>Listo para validacion en servidor</h2>
            <p>
              Cuando conectes el backend, solo reemplaza el consumo local del
              `credential` por la validacion del token en tu API.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.card}>{children}</div>
      </section>
    </div>
  );
}

export default AuthShell;

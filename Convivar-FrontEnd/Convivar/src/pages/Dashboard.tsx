import { Building2, CalendarDays, CreditCard, Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import styles from "./Dashboard.module.css";

const dashboardCards = [
  {
    icon: Building2,
    title: "142 unidades",
    description: "Propiedades activas y sincronizadas con la administracion.",
  },
  {
    icon: Users,
    title: "318 residentes",
    description: "Base de residentes con informacion al dia y accesible.",
  },
  {
    icon: CreditCard,
    title: "94% recaudo",
    description: "Seguimiento consolidado del cumplimiento financiero mensual.",
  },
  {
    icon: CalendarDays,
    title: "26 reservas",
    description: "Solicitudes y espacios comunes programados para esta semana.",
  },
];

function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Panel principal</p>
        <h1>Hola, {currentUser?.fullName}</h1>
        <p className={styles.description}>
          Tu sesion esta lista. Desde aqui puedes coordinar la operacion del
          conjunto y escalar nuevos modulos sin romper la arquitectura base.
        </p>
      </div>

      <div className={styles.grid}>
        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <article className={styles.card} key={card.title}>
              <div className={styles.cardIcon}>
                <Icon size={20} />
              </div>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Dashboard;

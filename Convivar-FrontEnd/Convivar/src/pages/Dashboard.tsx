import { Building2, CalendarDays, CreditCard, Users } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useResidentialComplex } from "../hooks/useResidentialComplex";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const { currentUser } = useAuth();
  const { selectedComplex } = useResidentialComplex();

  const dashboardCards = [
    {
      icon: Building2,
      title: `${selectedComplex?.metrics.units ?? 0} unidades`,
      description: "Propiedades activas y sincronizadas con la administracion.",
    },
    {
      icon: Users,
      title: `${selectedComplex?.metrics.residents ?? 0} residentes`,
      description: "Base de residentes con informacion al dia y accesible.",
    },
    {
      icon: CreditCard,
      title: `${selectedComplex?.metrics.collectionRate ?? 0}% recaudo`,
      description: "Seguimiento consolidado del cumplimiento financiero mensual.",
    },
    {
      icon: CalendarDays,
      title: `${selectedComplex?.metrics.weeklyReservations ?? 0} reservas`,
      description: "Solicitudes y espacios comunes programados para esta semana.",
    },
  ];

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Panel principal</p>
        <h1>{selectedComplex?.name}</h1>
        <p className={styles.description}>
          Hola, {currentUser?.fullName}. Estas viendo la operacion de{" "}
          {selectedComplex?.name}; desde aqui puedes analizar metricas y entrar
          a los modulos de este conjunto.
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

import type { NavigationItem } from "../types/navigation";
import { useResidentialComplex } from "../hooks/useResidentialComplex";
import styles from "./SectionPage.module.css";

type SectionPageProps = {
  item: NavigationItem;
};

function SectionPage({ item }: SectionPageProps) {
  const Icon = item.icon;
  const { selectedComplex } = useResidentialComplex();

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.iconWrap}>
          <Icon size={28} />
        </div>
        <div>
          <p className={styles.eyebrow}>Modulo</p>
          <h1>{item.label}</h1>
          <p>
            {item.description} Contexto activo: {selectedComplex?.name}.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <h2>Gestion de {selectedComplex?.name}</h2>
        <p>
          Esta vista queda lista para incorporar tablas, filtros, formularios y
          widgets propios de este conjunto residencial sin mezclar sus datos con
          otros conjuntos administrados.
        </p>
      </div>
    </section>
  );
}

export default SectionPage;

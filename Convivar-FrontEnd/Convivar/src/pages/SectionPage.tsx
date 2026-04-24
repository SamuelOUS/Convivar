import type { NavigationItem } from "../types/navigation";
import styles from "./SectionPage.module.css";

type SectionPageProps = {
  item: NavigationItem;
};

function SectionPage({ item }: SectionPageProps) {
  const Icon = item.icon;

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.iconWrap}>
          <Icon size={28} />
        </div>
        <div>
          <p className={styles.eyebrow}>Modulo</p>
          <h1>{item.label}</h1>
          <p>{item.description}</p>
        </div>
      </div>

      <div className={styles.card}>
        <h2>Espacio preparado para crecer</h2>
        <p>
          Esta vista queda lista para incorporar tablas, filtros, formularios y
          widgets sin mezclar la estructura del modulo con la navegacion global.
        </p>
      </div>
    </section>
  );
}

export default SectionPage;

import { Building2, LogOut, Repeat2 } from "lucide-react";
import type { JSX } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useResidentialComplex } from "../../hooks/useResidentialComplex";
import styles from "./Sidebar.module.css";
import { sidebarItems } from "./Sidebar.data.ts";

function Sidebar(): JSX.Element {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { clearSelectedComplex, selectedComplex } = useResidentialComplex();

  function handleSwitchComplex(): void {
    navigate("/conjuntos");
  }

  function handleLogout(): void {
    clearSelectedComplex();
    logout();
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <p className={styles.logoEyebrow}>Convivar</p>
        <h2>Mi ERP</h2>
        <p className={styles.logoDescription}>Operacion por conjunto.</p>
      </div>

      <div className={styles.complexCard}>
        <span className={styles.userLabel}>Conjunto activo</span>
        <strong>
          <Building2 size={16} />
          {selectedComplex?.name}
        </strong>
        <span>{selectedComplex?.address}</span>
        <button
          className={styles.switchButton}
          onClick={handleSwitchComplex}
          type="button"
        >
          <Repeat2 size={16} />
          Cambiar conjunto
        </button>
      </div>

      <nav className={styles.nav}>
        {sidebarItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.icon}>
                <Icon size={18} />
              </span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userCard}>
          <span className={styles.userLabel}>Sesion activa</span>
          <strong>{currentUser?.fullName}</strong>
          <span>{currentUser?.role}</span>
        </div>

        <button className={styles.logoutButton} onClick={handleLogout} type="button">
          <LogOut size={16} />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

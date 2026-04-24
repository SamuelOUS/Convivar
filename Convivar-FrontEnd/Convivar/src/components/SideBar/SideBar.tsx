import { LogOut } from "lucide-react";
import type { JSX } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Sidebar.module.css";
import { sidebarItems } from "./Sidebar.data.ts";

function Sidebar(): JSX.Element {
  const { currentUser, logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <p className={styles.logoEyebrow}>Convivar</p>
        <h2>Mi ERP</h2>
        <p className={styles.logoDescription}>
          Operacion administrativa centralizada.
        </p>
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

        <button className={styles.logoutButton} onClick={logout} type="button">
          <LogOut size={16} />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

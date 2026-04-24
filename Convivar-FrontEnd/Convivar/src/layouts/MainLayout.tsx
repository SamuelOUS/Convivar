import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar/SideBar";
import styles from "./MainLayout.module.css";

function MainLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;

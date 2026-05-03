import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function PublicRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <div>Cargando sesion...</div>;
  }

  if (isAuthenticated) {
    return <Navigate replace to="/conjuntos" />;
  }

  return <Outlet />;
}

export default PublicRoute;

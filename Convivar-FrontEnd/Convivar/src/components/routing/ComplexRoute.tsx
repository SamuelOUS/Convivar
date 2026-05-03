import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useResidentialComplex } from "../../hooks/useResidentialComplex";

function ComplexRoute() {
  const { selectedComplex } = useResidentialComplex();
  const location = useLocation();

  if (!selectedComplex) {
    return <Navigate replace state={{ from: location }} to="/conjuntos" />;
  }

  return <Outlet />;
}

export default ComplexRoute;

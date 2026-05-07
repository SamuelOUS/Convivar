import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useResidentialComplex } from "../../hooks/useResidentialComplex";

function ComplexRoute() {
  const { error, isLoading, selectedComplex, selectedComplexId } =
    useResidentialComplex();
  const location = useLocation();

  if (!selectedComplex && selectedComplexId && (isLoading || !error)) {
    return <p>Cargando conjunto residencial...</p>;
  }

  if (!selectedComplex) {
    return <Navigate replace state={{ from: location }} to="/conjuntos" />;
  }

  return <Outlet />;
}

export default ComplexRoute;

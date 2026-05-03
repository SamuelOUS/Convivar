import { useContext } from "react";
import { ResidentialComplexContext } from "../context/ResidentialComplexContextDefinition";

export function useResidentialComplex() {
  const context = useContext(ResidentialComplexContext);

  if (!context) {
    throw new Error(
      "useResidentialComplex debe usarse dentro de ResidentialComplexProvider",
    );
  }

  return context;
}

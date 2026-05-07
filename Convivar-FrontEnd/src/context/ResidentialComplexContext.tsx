import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import {
  createResidentialComplex,
  listResidentialComplexes,
} from "../services/residentialComplex/residentialComplexService";
import { useAuth } from "../hooks/useAuth";
import type {
  CreateResidentialComplexData,
  ResidentialComplex,
} from "../types/residentialComplex";
import {
  ResidentialComplexContext,
  type ResidentialComplexContextValue,
} from "./ResidentialComplexContextDefinition";

const selectedComplexStorageKey = "convivar:selected-complex-id";

function loadSelectedComplexId(): string | null {
  return window.localStorage.getItem(selectedComplexStorageKey);
}

export function ResidentialComplexProvider({ children }: PropsWithChildren) {
  const { authToken, isAuthenticated } = useAuth();
  const [complexes, setComplexes] = useState<ResidentialComplex[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedComplexId, setSelectedComplexId] = useState<string | null>(() =>
    loadSelectedComplexId(),
  );

  const selectedComplex = useMemo(
    () =>
      complexes.find((complex) => complex.id === selectedComplexId) ?? null,
    [complexes, selectedComplexId],
  );

  const refreshComplexes = useCallback(async (): Promise<void> => {
    if (!authToken) {
      setComplexes([]);
      setError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await listResidentialComplexes(authToken);
      setComplexes(response.complexes);

      if (
        selectedComplexId &&
        !response.complexes.some((complex) => complex.id === selectedComplexId)
      ) {
        clearSelectedComplex();
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible cargar los conjuntos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [authToken, selectedComplexId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setComplexes([]);
      clearSelectedComplex();
      return;
    }

    void refreshComplexes();
  }, [isAuthenticated, refreshComplexes]);

  function selectComplex(complexId: string): void {
    window.localStorage.setItem(selectedComplexStorageKey, complexId);
    setSelectedComplexId(complexId);
  }

  function clearSelectedComplex(): void {
    window.localStorage.removeItem(selectedComplexStorageKey);
    setSelectedComplexId(null);
  }

  async function createComplex(
    data: CreateResidentialComplexData,
  ): Promise<void> {
    if (!authToken) {
      throw new Error("No se encontro sesion activa.");
    }

    const response = await createResidentialComplex(authToken, data);
    setComplexes((current) => [...current, response.complex].sort((a, b) =>
      a.name.localeCompare(b.name),
    ));
    selectComplex(response.complex.id);
  }

  const value: ResidentialComplexContextValue = {
    complexes,
    error,
    isLoading,
    selectedComplexId,
    selectedComplex,
    createComplex,
    refreshComplexes,
    selectComplex,
    clearSelectedComplex,
  };

  return (
    <ResidentialComplexContext.Provider value={value}>
      {children}
    </ResidentialComplexContext.Provider>
  );
}

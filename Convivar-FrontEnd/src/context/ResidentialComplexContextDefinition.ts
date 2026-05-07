import { createContext } from "react";
import type {
  CreateResidentialComplexData,
  ResidentialComplex,
} from "../types/residentialComplex";

export type ResidentialComplexContextValue = {
  complexes: ResidentialComplex[];
  error: string;
  isLoading: boolean;
  selectedComplexId: string | null;
  selectedComplex: ResidentialComplex | null;
  createComplex: (data: CreateResidentialComplexData) => Promise<void>;
  refreshComplexes: () => Promise<void>;
  selectComplex: (complexId: string) => void;
  clearSelectedComplex: () => void;
};

export const ResidentialComplexContext =
  createContext<ResidentialComplexContextValue | undefined>(undefined);

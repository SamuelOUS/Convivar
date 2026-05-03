import type {
  CreateResidentialComplexData,
  ResidentialComplex,
} from "../../types/residentialComplex";
import { request } from "../api/apiClient";

export function listResidentialComplexes(token: string) {
  return request<{ complexes: ResidentialComplex[] }>("/residential-complexes", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createResidentialComplex(
  token: string,
  data: CreateResidentialComplexData,
) {
  return request<{ complex: ResidentialComplex }>("/residential-complexes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });
}

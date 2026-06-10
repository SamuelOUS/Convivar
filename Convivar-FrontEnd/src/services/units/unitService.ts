import type { UnitsOverview } from "../../types/unit";
import { request } from "../api/apiClient";

export function getUnitsOverview(token: string, complexId: string) {
  return request<UnitsOverview>(`/residential-complexes/${complexId}/units`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

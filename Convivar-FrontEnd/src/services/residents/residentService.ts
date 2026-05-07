import type {
  ImportResidentData,
  Resident,
  ResidentFilters,
  ResidentPagination,
  ResidentStats,
  UpdateResidentData,
} from "../../types/residentialComplex";
import { request } from "../api/apiClient";

export type ListResidentsOptions = {
  page: number;
  pageSize: number;
  search: string;
} & ResidentFilters;

export function listResidents(
  token: string,
  complexId: string,
  options: ListResidentsOptions,
) {
  const params = new URLSearchParams({
    page: String(options.page),
    pageSize: String(options.pageSize),
  });
  const optionalParams = {
    search: options.search,
    status: options.status,
    unitLabel: options.unitLabel,
    residentType: options.residentType,
    registeredFrom: options.registeredFrom,
    registeredTo: options.registeredTo,
  };

  Object.entries(optionalParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return request<{
    residents: Resident[];
    pagination: ResidentPagination;
    stats: ResidentStats;
  }>(
    `/residential-complexes/${complexId}/residents?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function importResidents(
  token: string,
  complexId: string,
  residents: ImportResidentData[],
) {
  return request<{
    residents: Resident[];
    imported: number;
    updated: number;
  }>(`/residential-complexes/${complexId}/residents/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: { residents },
  });
}

export function updateResident(
  token: string,
  complexId: string,
  residentId: string,
  data: UpdateResidentData,
) {
  return request<{ resident: Resident }>(
    `/residential-complexes/${complexId}/residents/${residentId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    },
  );
}

import type {
  CreateFinancialMovementData,
  FinanceOverview,
  FinancialMovement,
  GenerateMonthlyChargesData,
} from "../../types/finance";
import { request } from "../api/apiClient";

export function getFinanceOverview(token: string, complexId: string) {
  return request<FinanceOverview>(
    `/residential-complexes/${complexId}/finances`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function createFinancialMovement(
  token: string,
  complexId: string,
  data: CreateFinancialMovementData,
) {
  return request<{ movement: FinancialMovement }>(
    `/residential-complexes/${complexId}/finances/movements`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    },
  );
}

export function generateMonthlyCharges(
  token: string,
  complexId: string,
  data: GenerateMonthlyChargesData,
) {
  return request<{ created: number }>(
    `/residential-complexes/${complexId}/finances/monthly-charges`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    },
  );
}

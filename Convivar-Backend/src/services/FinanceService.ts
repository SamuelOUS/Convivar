import { AppError } from "../errors/AppError.js";
import { FinanceRepository } from "../repositories/FinanceRepository.js";
import { ResidentialComplexRepository } from "../repositories/ResidentialComplexRepository.js";
import type {
  CreateFinancialMovementRequest,
  FinanceOverview,
  FinancialMovement,
  GenerateMonthlyChargesRequest,
} from "../types/finance.types.js";
import { createId } from "../utils/id.utils.js";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export class FinanceService {
  constructor(
    private readonly financeRepository: FinanceRepository,
    private readonly residentialComplexRepository: ResidentialComplexRepository,
  ) {}

  async getOverview(
    userId: string,
    residentialComplexId: string,
  ): Promise<FinanceOverview> {
    await this.ensureComplexOwnership(userId, residentialComplexId);
    await this.financeRepository.syncAccountsFromResidents(residentialComplexId);
    const accounts =
      await this.financeRepository.findAccountsByComplexId(residentialComplexId);
    const totalCharges = accounts.reduce(
      (total, account) => total + account.charges,
      0,
    );
    const totalPayments = accounts.reduce(
      (total, account) => total + account.payments,
      0,
    );
    const totalBalance = accounts.reduce(
      (total, account) => total + account.balance,
      0,
    );

    return {
      accounts,
      summary: {
        totalUnits: accounts.length,
        totalCharges,
        totalPayments,
        totalBalance,
        overdueUnits: accounts.filter((account) => account.status === "En mora")
          .length,
        collectionRate:
          totalCharges > 0 ? Math.round((totalPayments / totalCharges) * 100) : 0,
      },
    };
  }

  async createMovement(
    userId: string,
    residentialComplexId: string,
    payload: CreateFinancialMovementRequest,
  ): Promise<FinancialMovement> {
    await this.ensureComplexOwnership(userId, residentialComplexId);
    await this.financeRepository.syncAccountsFromResidents(residentialComplexId);
    const account = await this.financeRepository.findAccountByIdForComplex(
      payload.accountId,
      residentialComplexId,
    );

    if (!account) {
      throw new AppError("No se encontro la cartera de la unidad.", 404);
    }

    return this.financeRepository.saveMovement({
      id: createId(),
      accountId: payload.accountId,
      movementType: payload.movementType,
      concept: payload.concept,
      amount: payload.amount,
      movementDate: payload.movementDate ?? today(),
      notes: payload.notes ?? null,
    });
  }

  async generateMonthlyCharges(
    userId: string,
    residentialComplexId: string,
    payload: GenerateMonthlyChargesRequest,
  ): Promise<{ created: number }> {
    await this.ensureComplexOwnership(userId, residentialComplexId);
    await this.financeRepository.syncAccountsFromResidents(residentialComplexId);
    const accounts =
      await this.financeRepository.findAccountsByComplexId(residentialComplexId);
    let created = 0;

    for (const account of accounts) {
      await this.financeRepository.saveMovement({
        id: createId(),
        accountId: account.id,
        movementType: "Cargo",
        concept: payload.concept,
        amount: payload.amount,
        movementDate: payload.movementDate ?? today(),
        notes: "Cargo generado masivamente.",
      });
      created += 1;
    }

    return { created };
  }

  private async ensureComplexOwnership(
    userId: string,
    residentialComplexId: string,
  ): Promise<void> {
    const complex = await this.residentialComplexRepository.findByIdForUser(
      residentialComplexId,
      userId,
    );

    if (!complex) {
      throw new AppError("No se encontro el conjunto residencial solicitado.", 404);
    }
  }
}

import { AppError } from "../errors/AppError.js";
import { FinanceRepository } from "../repositories/FinanceRepository.js";
import { ResidentialComplexRepository } from "../repositories/ResidentialComplexRepository.js";
import type {
  FinancialAccountStatus,
  UnitFinancialAccount,
} from "../types/finance.types.js";
import type {
  ManagedUnit,
  UnitGroup,
  UnitsOverview,
  UnitType,
} from "../types/unit.types.js";

const auxiliaryTypeMatchers: Array<[UnitType, RegExp]> = [
  ["Cuarto util", /\b(cuarto\s+util|deposito|bodega|storage|c\.?\s*u\.?)\b/i],
  ["Parqueadero", /\b(parqueadero|parking|garaje|garage|parq|pq|pk)\b/i],
];

function removeAccents(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalize(value: string): string {
  return removeAccents(value).toLowerCase();
}

function getUnitType(label: string): UnitType {
  const normalizedLabel = normalize(label);
  const match = auxiliaryTypeMatchers.find(([, matcher]) =>
    matcher.test(normalizedLabel),
  );

  return match?.[0] ?? "Apartamento";
}

function getNumericTokens(label: string): string[] {
  return normalize(label).match(/\d+[a-z]?/g) ?? [];
}

function getApartmentReference(label: string): string | null {
  const normalizedLabel = normalize(label);
  const explicitMatch = normalizedLabel.match(
    /\b(?:apto|apartamento|ap)\s*[-#:]*\s*([a-z]?\d+[a-z]?)\b/i,
  );

  if (explicitMatch?.[1]) {
    return explicitMatch[1];
  }

  const tokens = getNumericTokens(label);
  return tokens.length > 0 ? tokens[tokens.length - 1] : null;
}

function getStatusPriority(status: FinancialAccountStatus): number {
  if (status === "En mora") {
    return 3;
  }

  if (status === "Pendiente") {
    return 2;
  }

  return 1;
}

function mergeStatus(
  statuses: FinancialAccountStatus[],
): FinancialAccountStatus {
  return statuses.reduce<FinancialAccountStatus>(
    (current, status) =>
      getStatusPriority(status) > getStatusPriority(current) ? status : current,
    "Al dia",
  );
}

function toManagedUnit(account: UnitFinancialAccount): ManagedUnit {
  return {
    id: account.id,
    label: account.unitLabel,
    type: getUnitType(account.unitLabel),
    residents: account.residents,
    financialAccount: account,
  };
}

function buildGroup(apartment: ManagedUnit, associatedUnits: ManagedUnit[]): UnitGroup {
  const units = [apartment, ...associatedUnits];

  return {
    id: apartment.id,
    apartment,
    associatedUnits,
    totalCharges: units.reduce(
      (total, unit) => total + unit.financialAccount.charges,
      0,
    ),
    totalPayments: units.reduce(
      (total, unit) => total + unit.financialAccount.payments,
      0,
    ),
    totalBalance: units.reduce(
      (total, unit) => total + unit.financialAccount.balance,
      0,
    ),
    status: mergeStatus(units.map((unit) => unit.financialAccount.status)),
  };
}

export class UnitService {
  constructor(
    private readonly financeRepository: FinanceRepository,
    private readonly residentialComplexRepository: ResidentialComplexRepository,
  ) {}

  async getOverview(
    userId: string,
    residentialComplexId: string,
  ): Promise<UnitsOverview> {
    await this.ensureComplexOwnership(userId, residentialComplexId);
    await this.financeRepository.syncAccountsFromResidents(residentialComplexId);

    const accounts =
      await this.financeRepository.findAccountsByComplexId(residentialComplexId);
    const units = accounts.map(toManagedUnit);
    const apartments = units.filter((unit) => unit.type === "Apartamento");
    const auxiliaryUnits = units.filter((unit) => unit.type !== "Apartamento");
    const apartmentsByReference = new Map<string, ManagedUnit>();

    apartments.forEach((apartment) => {
      const reference = getApartmentReference(apartment.label);

      if (reference && !apartmentsByReference.has(reference)) {
        apartmentsByReference.set(reference, apartment);
      }
    });

    const associatedByApartmentId = new Map<string, ManagedUnit[]>();
    const standaloneUnits: ManagedUnit[] = [];

    auxiliaryUnits.forEach((unit) => {
      const reference = getApartmentReference(unit.label);
      const apartment = reference ? apartmentsByReference.get(reference) : null;

      if (!apartment) {
        standaloneUnits.push(unit);
        return;
      }

      const currentUnits = associatedByApartmentId.get(apartment.id) ?? [];
      currentUnits.push(unit);
      associatedByApartmentId.set(apartment.id, currentUnits);
    });

    const groups = apartments.map((apartment) =>
      buildGroup(apartment, associatedByApartmentId.get(apartment.id) ?? []),
    );

    return {
      groups,
      standaloneUnits,
      summary: {
        totalUnits: units.length,
        apartments: apartments.length,
        parkingSpaces: units.filter((unit) => unit.type === "Parqueadero")
          .length,
        storageRooms: units.filter((unit) => unit.type === "Cuarto util")
          .length,
        groupedApartments: groups.filter(
          (group) => group.associatedUnits.length > 0,
        ).length,
        standaloneUnits: standaloneUnits.length,
        totalBalance: units.reduce(
          (total, unit) => total + unit.financialAccount.balance,
          0,
        ),
      },
    };
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

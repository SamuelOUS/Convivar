import { AppError } from "../errors/AppError.js";
import { ResidentialComplexRepository } from "../repositories/ResidentialComplexRepository.js";
import type {
  CreateResidentialComplexRequest,
  ResidentialComplex,
} from "../types/residentialComplex.types.js";
import { nowIsoString } from "../utils/date.utils.js";
import { createId } from "../utils/id.utils.js";

export class ResidentialComplexService {
  constructor(
    private readonly residentialComplexRepository: ResidentialComplexRepository,
  ) {}

  listByUser(userId: string): Promise<ResidentialComplex[]> {
    return this.residentialComplexRepository.findByUserId(userId);
  }

  async create(
    userId: string,
    payload: CreateResidentialComplexRequest,
  ): Promise<ResidentialComplex> {
    const name = payload.name.trim();
    const existingComplex =
      await this.residentialComplexRepository.findByUserIdAndName(userId, name);

    if (existingComplex) {
      throw new AppError("Ya existe un conjunto con este nombre.", 409);
    }

    const timestamp = nowIsoString();

    return this.residentialComplexRepository.save({
      id: createId(),
      userId,
      name,
      address: payload.address.trim(),
      administrator: payload.administrator.trim(),
      status: payload.status ?? "Activo",
      units: payload.units ?? 0,
      residents: payload.residents ?? 0,
      collectionRate: payload.collectionRate ?? 0,
      weeklyReservations: payload.weeklyReservations ?? 0,
      openMaintenance: payload.openMaintenance ?? 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
}

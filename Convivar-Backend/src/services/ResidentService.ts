import { AppError } from "../errors/AppError.js";
import { ResidentRepository } from "../repositories/ResidentRepository.js";
import { ResidentialComplexRepository } from "../repositories/ResidentialComplexRepository.js";
import type {
  ImportResidentRequest,
  Resident,
  ResidentListQuery,
  ResidentListResult,
  UpdateResidentRequest,
} from "../types/resident.types.js";
import { nowIsoString } from "../utils/date.utils.js";
import { createId } from "../utils/id.utils.js";

export class ResidentService {
  constructor(
    private readonly residentRepository: ResidentRepository,
    private readonly residentialComplexRepository: ResidentialComplexRepository,
  ) {}

  async listByComplex(
    userId: string,
    residentialComplexId: string,
    query: ResidentListQuery,
  ): Promise<ResidentListResult> {
    await this.ensureComplexOwnership(userId, residentialComplexId);
    const filters = {
      search: query.search,
      status: query.status,
      unitLabel: query.unitLabel,
      residentType: query.residentType,
      registeredFrom: query.registeredFrom,
      registeredTo: query.registeredTo,
    };

    if (
      filters.registeredFrom &&
      filters.registeredTo &&
      filters.registeredFrom > filters.registeredTo
    ) {
      throw new AppError(
        "La fecha inicial de registro no puede ser mayor a la fecha final.",
        400,
      );
    }

    const total = await this.residentRepository.countByComplexId(
      residentialComplexId,
      filters,
    );
    const stats = await this.residentRepository.getStatsByComplexId(
      residentialComplexId,
    );
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, totalPages);
    const residents = await this.residentRepository.findByComplexId(
      residentialComplexId,
      {
        ...filters,
        limit: query.pageSize,
        offset: (page - 1) * query.pageSize,
      },
    );

    return {
      residents,
      pagination: {
        page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
      stats,
    };
  }

  async importResidents(
    userId: string,
    residentialComplexId: string,
    residents: ImportResidentRequest[],
  ): Promise<{ residents: Resident[]; imported: number; updated: number }> {
    await this.ensureComplexOwnership(userId, residentialComplexId);

    const importedResidents: Resident[] = [];
    let imported = 0;
    let updated = 0;

    for (const resident of residents) {
      const timestamp = nowIsoString();
      const documentNumber = resident.documentNumber?.trim() || null;
      const email = resident.email?.trim().toLowerCase() || null;
      const existingResident = await this.residentRepository.findExistingIdentity(
        residentialComplexId,
        documentNumber,
        email,
      );
      const input = {
        id: existingResident?.id ?? createId(),
        residentialComplexId,
        fullName: resident.fullName.trim(),
        documentNumber,
        email,
        phone: resident.phone?.trim() || null,
        unitLabel: resident.unitLabel.trim(),
        residentType: resident.residentType ?? "Residente",
        status: resident.status ?? "Activo",
        importedAt: timestamp,
        createdAt: existingResident?.createdAt ?? timestamp,
        updatedAt: timestamp,
      };

      if (existingResident) {
        importedResidents.push(await this.residentRepository.update(existingResident.id, input));
        updated += 1;
        continue;
      }

      importedResidents.push(await this.residentRepository.save(input));
      imported += 1;
    }

    const totalResidents =
      await this.residentRepository.countAllByComplexId(residentialComplexId);
    await this.residentialComplexRepository.updateResidentsCount(
      residentialComplexId,
      totalResidents,
    );

    return { residents: importedResidents, imported, updated };
  }

  async updateResident(
    userId: string,
    residentialComplexId: string,
    residentId: string,
    payload: UpdateResidentRequest,
  ): Promise<Resident> {
    await this.ensureComplexOwnership(userId, residentialComplexId);
    const existingResident = await this.residentRepository.findByIdForComplex(
      residentId,
      residentialComplexId,
    );

    if (!existingResident) {
      throw new AppError("No se encontro el residente solicitado.", 404);
    }

    const documentNumber = payload.documentNumber?.trim() || null;
    const email = payload.email?.trim().toLowerCase() || null;
    const duplicateResident =
      await this.residentRepository.findExistingIdentity(
        residentialComplexId,
        documentNumber,
        email,
        residentId,
      );

    if (duplicateResident) {
      throw new AppError(
        "Ya existe otro residente con este documento o correo.",
        409,
      );
    }

    const resident = await this.residentRepository.update(residentId, {
      id: residentId,
      residentialComplexId,
      fullName: payload.fullName.trim(),
      documentNumber,
      email,
      phone: payload.phone?.trim() || null,
      unitLabel: payload.unitLabel.trim(),
      residentType: payload.residentType ?? "Residente",
      status: payload.status ?? "Activo",
      importedAt: existingResident.importedAt,
      createdAt: existingResident.createdAt,
      updatedAt: nowIsoString(),
    });

    const totalResidents =
      await this.residentRepository.countAllByComplexId(residentialComplexId);
    await this.residentialComplexRepository.updateResidentsCount(
      residentialComplexId,
      totalResidents,
    );

    return resident;
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

import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { UnitService } from "../services/UnitService.js";

export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  overview = async (request: Request, response: Response): Promise<void> => {
    const userId = this.getAuthenticatedUserId(request);
    const residentialComplexId = this.getResidentialComplexId(request);
    const overview = await this.unitService.getOverview(
      userId,
      residentialComplexId,
    );

    response.status(200).json(overview);
  };

  private getAuthenticatedUserId(request: Request): string {
    if (!request.auth?.sub) {
      throw new AppError("No se encontro sesion activa.", 401);
    }

    return request.auth.sub;
  }

  private getResidentialComplexId(request: Request): string {
    const { complexId } = request.params;

    if (!complexId || Array.isArray(complexId)) {
      throw new AppError("No se envio el conjunto residencial.", 400);
    }

    return complexId;
  }
}

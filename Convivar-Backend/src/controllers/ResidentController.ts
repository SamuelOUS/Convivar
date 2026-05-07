import type { Request, Response } from "express";
import type { z } from "zod";
import { AppError } from "../errors/AppError.js";
import {
  importResidentsSchema,
  residentListQuerySchema,
  updateResidentSchema,
} from "../schemas/resident.schemas.js";
import { ResidentService } from "../services/ResidentService.js";

export class ResidentController {
  constructor(private readonly residentService: ResidentService) {}

  list = async (request: Request, response: Response): Promise<void> => {
    const userId = this.getAuthenticatedUserId(request);
    const residentialComplexId = this.getResidentialComplexId(request);
    const query = this.parseBody(residentListQuerySchema, request.query);
    const result = await this.residentService.listByComplex(
      userId,
      residentialComplexId,
      query,
    );
    response.status(200).json(result);
  };

  import = async (request: Request, response: Response): Promise<void> => {
    const userId = this.getAuthenticatedUserId(request);
    const residentialComplexId = this.getResidentialComplexId(request);
    const payload = this.parseBody(importResidentsSchema, request.body);
    const result = await this.residentService.importResidents(
      userId,
      residentialComplexId,
      payload.residents,
    );
    response.status(201).json(result);
  };

  update = async (request: Request, response: Response): Promise<void> => {
    const userId = this.getAuthenticatedUserId(request);
    const residentialComplexId = this.getResidentialComplexId(request);
    const residentId = this.getResidentId(request);
    const payload = this.parseBody(updateResidentSchema, request.body);
    const resident = await this.residentService.updateResident(
      userId,
      residentialComplexId,
      residentId,
      payload,
    );
    response.status(200).json({ resident });
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

  private getResidentId(request: Request): string {
    const { residentId } = request.params;

    if (!residentId || Array.isArray(residentId)) {
      throw new AppError("No se envio el residente.", 400);
    }

    return residentId;
  }

  private parseBody<TSchema extends z.ZodTypeAny>(
    schema: TSchema,
    body: unknown,
  ): z.infer<TSchema> {
    return schema.parse(body);
  }
}

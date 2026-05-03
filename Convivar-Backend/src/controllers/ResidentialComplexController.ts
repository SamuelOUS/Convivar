import type { Request, Response } from "express";
import type { z } from "zod";
import { AppError } from "../errors/AppError.js";
import { createResidentialComplexSchema } from "../schemas/residentialComplex.schemas.js";
import { ResidentialComplexService } from "../services/ResidentialComplexService.js";

export class ResidentialComplexController {
  constructor(
    private readonly residentialComplexService: ResidentialComplexService,
  ) {}

  list = async (request: Request, response: Response): Promise<void> => {
    const userId = this.getAuthenticatedUserId(request);
    const complexes = await this.residentialComplexService.listByUser(userId);
    response.status(200).json({ complexes });
  };

  create = async (request: Request, response: Response): Promise<void> => {
    const userId = this.getAuthenticatedUserId(request);
    const payload = this.parseBody(createResidentialComplexSchema, request.body);
    const complex = await this.residentialComplexService.create(userId, payload);
    response.status(201).json({ complex });
  };

  private getAuthenticatedUserId(request: Request): string {
    if (!request.auth?.sub) {
      throw new AppError("No se encontro sesion activa.", 401);
    }

    return request.auth.sub;
  }

  private parseBody<TSchema extends z.ZodTypeAny>(
    schema: TSchema,
    body: unknown,
  ): z.infer<TSchema> {
    return schema.parse(body);
  }
}

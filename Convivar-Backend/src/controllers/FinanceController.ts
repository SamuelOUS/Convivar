import type { Request, Response } from "express";
import type { z } from "zod";
import { AppError } from "../errors/AppError.js";
import {
  createFinancialMovementSchema,
  generateMonthlyChargesSchema,
} from "../schemas/finance.schemas.js";
import { FinanceService } from "../services/FinanceService.js";

export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  overview = async (request: Request, response: Response): Promise<void> => {
    const userId = this.getAuthenticatedUserId(request);
    const residentialComplexId = this.getResidentialComplexId(request);
    const overview = await this.financeService.getOverview(
      userId,
      residentialComplexId,
    );
    response.status(200).json(overview);
  };

  createMovement = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    const userId = this.getAuthenticatedUserId(request);
    const residentialComplexId = this.getResidentialComplexId(request);
    const payload = this.parseBody(createFinancialMovementSchema, request.body);
    const movement = await this.financeService.createMovement(
      userId,
      residentialComplexId,
      payload,
    );
    response.status(201).json({ movement });
  };

  generateMonthlyCharges = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    const userId = this.getAuthenticatedUserId(request);
    const residentialComplexId = this.getResidentialComplexId(request);
    const payload = this.parseBody(generateMonthlyChargesSchema, request.body);
    const result = await this.financeService.generateMonthlyCharges(
      userId,
      residentialComplexId,
      payload,
    );
    response.status(201).json(result);
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

  private parseBody<TSchema extends z.ZodTypeAny>(
    schema: TSchema,
    body: unknown,
  ): z.infer<TSchema> {
    return schema.parse(body);
  }
}

import { Router } from "express";
import { FinanceController } from "../controllers/FinanceController.js";
import { authenticateRequest } from "../middlewares/authenticateRequest.js";

export function createFinanceRouter(
  financeController: FinanceController,
): Router {
  const router = Router();

  router.use(authenticateRequest);
  router.get(
    "/residential-complexes/:complexId/finances",
    financeController.overview,
  );
  router.post(
    "/residential-complexes/:complexId/finances/movements",
    financeController.createMovement,
  );
  router.post(
    "/residential-complexes/:complexId/finances/monthly-charges",
    financeController.generateMonthlyCharges,
  );

  return router;
}

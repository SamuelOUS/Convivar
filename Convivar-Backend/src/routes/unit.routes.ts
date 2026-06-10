import { Router } from "express";
import { UnitController } from "../controllers/UnitController.js";
import { authenticateRequest } from "../middlewares/authenticateRequest.js";

export function createUnitRouter(unitController: UnitController): Router {
  const router = Router();

  router.use(authenticateRequest);
  router.get("/residential-complexes/:complexId/units", unitController.overview);

  return router;
}

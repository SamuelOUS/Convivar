import { Router } from "express";
import { ResidentialComplexController } from "../controllers/ResidentialComplexController.js";
import { authenticateRequest } from "../middlewares/authenticateRequest.js";

export function createResidentialComplexRouter(
  residentialComplexController: ResidentialComplexController,
): Router {
  const router = Router();

  router.use(authenticateRequest);
  router.get("/", residentialComplexController.list);
  router.post("/", residentialComplexController.create);

  return router;
}

import { Router } from "express";
import { ResidentController } from "../controllers/ResidentController.js";
import { authenticateRequest } from "../middlewares/authenticateRequest.js";

export function createResidentRouter(
  residentController: ResidentController,
): Router {
  const router = Router();

  router.use(authenticateRequest);
  router.get(
    "/residential-complexes/:complexId/residents",
    residentController.list,
  );
  router.post(
    "/residential-complexes/:complexId/residents/import",
    residentController.import,
  );
  router.patch(
    "/residential-complexes/:complexId/residents/:residentId",
    residentController.update,
  );
  router.put(
    "/residential-complexes/:complexId/residents/:residentId",
    residentController.update,
  );

  return router;
}

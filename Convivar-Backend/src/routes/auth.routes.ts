import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { authenticateRequest } from "../middlewares/authenticateRequest.js";

export function createAuthRouter(authController: AuthController): Router {
  const router = Router();

  router.post("/login", authController.login);
  router.post("/register", authController.register);
  router.post("/google", authController.googleLogin);
  router.get("/me", authenticateRequest, authController.me);

  return router;
}

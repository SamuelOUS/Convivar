import cors from "cors";
import express from "express";
import { db } from "./config/database.js";
import { env } from "./config/env.js";
import { AuthController } from "./controllers/AuthController.js";
import { FinanceController } from "./controllers/FinanceController.js";
import { ResidentController } from "./controllers/ResidentController.js";
import { ResidentialComplexController } from "./controllers/ResidentialComplexController.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { ResidentialComplexRepository } from "./repositories/ResidentialComplexRepository.js";
import { FinanceRepository } from "./repositories/FinanceRepository.js";
import { ResidentRepository } from "./repositories/ResidentRepository.js";
import { UserRepository } from "./repositories/UserRepository.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { createFinanceRouter } from "./routes/finance.routes.js";
import { createResidentRouter } from "./routes/resident.routes.js";
import { createResidentialComplexRouter } from "./routes/residentialComplex.routes.js";
import { AuthService } from "./services/AuthService.js";
import { FinanceService } from "./services/FinanceService.js";
import { GoogleTokenVerifier } from "./services/GoogleTokenVerifier.js";
import { JwtService } from "./services/JwtService.js";
import { PasswordService } from "./services/PasswordService.js";
import { ResidentService } from "./services/ResidentService.js";
import { ResidentialComplexService } from "./services/ResidentialComplexService.js";

const userRepository = new UserRepository();
const passwordService = new PasswordService();
const jwtService = new JwtService();
const googleTokenVerifier = new GoogleTokenVerifier();
const residentialComplexRepository = new ResidentialComplexRepository();
const residentRepository = new ResidentRepository();
const financeRepository = new FinanceRepository();
const authService = new AuthService(
  userRepository,
  passwordService,
  jwtService,
  googleTokenVerifier,
);
const residentialComplexService = new ResidentialComplexService(
  residentialComplexRepository,
);
const residentService = new ResidentService(
  residentRepository,
  residentialComplexRepository,
);
const financeService = new FinanceService(
  financeRepository,
  residentialComplexRepository,
);
const authController = new AuthController(authService);
const residentialComplexController = new ResidentialComplexController(
  residentialComplexService,
);
const residentController = new ResidentController(residentService);
const financeController = new FinanceController(financeService);

export function createApp() {
  const app = express();
  const allowedOrigins = [
    env.FRONTEND_URL,
    "http://127.0.0.1:5173",
    "http://localhost:5173",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origen no permitido por CORS."));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));

  app.get("/api/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.get("/api/health/db", async (_request, response, next) => {
    try {
      await db.query("SELECT 1");
      response.status(200).json({ status: "ok", database: "connected" });
    } catch (error) {
      next(error);
    }
  });

  app.use("/api/auth", createAuthRouter(authController));
  app.use(
    "/api/residential-complexes",
    createResidentialComplexRouter(residentialComplexController),
  );
  app.use("/api", createResidentRouter(residentController));
  app.use("/api", createFinanceRouter(financeController));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";
export function errorHandler(error, _request, response, _next) {
    if (error instanceof ZodError) {
        response.status(400).json({
            message: "Datos invalidos en la solicitud.",
            errors: error.flatten(),
        });
        return;
    }
    if (error instanceof AppError) {
        response.status(error.statusCode).json({ message: error.message });
        return;
    }
    response.status(500).json({ message: "Ocurrio un error interno en el servidor." });
}

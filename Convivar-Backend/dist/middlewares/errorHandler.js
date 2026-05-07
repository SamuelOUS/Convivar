import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";
function isDatabaseError(error) {
    return "code" in error;
}
function isHttpError(error) {
    return "status" in error || "statusCode" in error;
}
export function errorHandler(error, _request, response, _next) {
    if (process.env.NODE_ENV !== "production") {
        console.error(error);
    }
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
    if (isHttpError(error)) {
        const statusCode = error.statusCode ?? error.status ?? 500;
        if (error.type === "entity.too.large" || statusCode === 413) {
            response.status(413).json({
                message: "El archivo contiene demasiados datos para importar en una sola carga. Divide el archivo o reduce la cantidad de filas.",
            });
            return;
        }
        if (statusCode >= 400 && statusCode < 500) {
            response.status(statusCode).json({
                message: error.message || "La solicitud no pudo ser procesada.",
            });
            return;
        }
    }
    if (isDatabaseError(error)) {
        if (error.code === "23505") {
            response.status(409).json({
                message: "Ya existe un residente con el mismo documento o correo en este conjunto.",
            });
            return;
        }
        if (error.code === "23503") {
            response.status(400).json({
                message: "No fue posible asociar los residentes al conjunto seleccionado.",
            });
            return;
        }
        if (error.code === "42P01") {
            response.status(500).json({
                message: "La base de datos no esta migrada para residentes. Ejecuta las migraciones del backend.",
            });
            return;
        }
    }
    response.status(500).json({ message: "Ocurrio un error interno en el servidor." });
}

import { AppError } from "../errors/AppError.js";
import { JwtService } from "../services/JwtService.js";
const jwtService = new JwtService();
export function authenticateRequest(request, _response, next) {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader?.startsWith("Bearer ")) {
        next(new AppError("No se envio un token de autorizacion valido.", 401));
        return;
    }
    const token = authorizationHeader.replace("Bearer ", "").trim();
    request.auth = jwtService.verify(token);
    next();
}

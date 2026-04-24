import { googleAuthSchema, loginSchema, registerSchema, } from "../schemas/auth.schemas.js";
export class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    login = async (request, response) => {
        const payload = this.parseBody(loginSchema, request.body);
        const session = await this.authService.login(payload);
        response.status(200).json(session);
    };
    register = async (request, response) => {
        const payload = this.parseBody(registerSchema, request.body);
        const session = await this.authService.register(payload);
        response.status(201).json(session);
    };
    googleLogin = async (request, response) => {
        const payload = this.parseBody(googleAuthSchema, request.body);
        const session = await this.authService.authenticateWithGoogle(payload);
        response.status(200).json(session);
    };
    me = async (request, response) => {
        if (!request.auth) {
            response.status(401).json({ message: "No se encontro sesion activa." });
            return;
        }
        response.status(200).json({
            user: {
                email: request.auth.email,
                fullName: request.auth.fullName,
                provider: request.auth.provider,
                role: request.auth.role,
            },
        });
    };
    parseBody(schema, body) {
        return schema.parse(body);
    }
}

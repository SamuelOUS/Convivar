# Convivar Backend

Backend de autenticacion para Convivar.

## Endpoints

- `GET /api/health`
- `GET /api/health/db`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/google`

## Variables de entorno

Usa `.env.example` como base.

## Base de datos

1. Crea una base PostgreSQL llamada `convivar` o ajusta `DATABASE_URL`.
2. Ejecuta `npm run db:migrate`.
3. Ejecuta `npm run db:seed`.

## Flujo Google

El frontend debe enviar el `credential` recibido desde Google Identity Services a
`POST /api/auth/google`. El backend valida el ID token con Google y crea o
actualiza el usuario local.

export function notFoundHandler(_request, response) {
    response.status(404).json({ message: "Ruta no encontrada." });
}

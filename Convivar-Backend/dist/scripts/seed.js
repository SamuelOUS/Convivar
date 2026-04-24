import { db } from "../config/database.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { PasswordService } from "../services/PasswordService.js";
import { nowIsoString } from "../utils/date.utils.js";
import { createId } from "../utils/id.utils.js";
async function seed() {
    const userRepository = new UserRepository();
    const passwordService = new PasswordService();
    const email = "admin@convivar.com";
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        console.log("El usuario administrador ya existe. Seed omitido.");
        return;
    }
    const timestamp = nowIsoString();
    const passwordHash = await passwordService.hash("Convivar2026!");
    await userRepository.save({
        id: createId(),
        email,
        fullName: "Administrador Convivar",
        passwordHash,
        provider: "credentials",
        role: "Administrador",
        createdAt: timestamp,
        updatedAt: timestamp,
    });
    console.log("Usuario administrador creado correctamente.");
}
seed()
    .catch((error) => {
    console.error("Error ejecutando seed:", error);
    process.exitCode = 1;
})
    .finally(async () => {
    await db.end();
});

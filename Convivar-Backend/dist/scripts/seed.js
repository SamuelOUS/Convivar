import { db } from "../config/database.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { ResidentialComplexRepository } from "../repositories/ResidentialComplexRepository.js";
import { PasswordService } from "../services/PasswordService.js";
import { nowIsoString } from "../utils/date.utils.js";
import { createId } from "../utils/id.utils.js";
const initialComplexes = [
    {
        name: "Bosques del Rio",
        address: "Carrera 18 #72-40",
        administrator: "Administracion Norte",
        status: "Activo",
        units: 142,
        residents: 318,
        collectionRate: 94,
        weeklyReservations: 26,
        openMaintenance: 11,
    },
    {
        name: "Altos de la Sabana",
        address: "Calle 9 #31-18",
        administrator: "Gestion Sabana",
        status: "Activo",
        units: 96,
        residents: 211,
        collectionRate: 88,
        weeklyReservations: 14,
        openMaintenance: 7,
    },
    {
        name: "Senderos de Monteverde",
        address: "Avenida 6 #45-12",
        administrator: "Equipo Monteverde",
        status: "En revision",
        units: 184,
        residents: 402,
        collectionRate: 91,
        weeklyReservations: 32,
        openMaintenance: 18,
    },
];
async function seedComplexes(user) {
    const residentialComplexRepository = new ResidentialComplexRepository();
    const timestamp = nowIsoString();
    for (const complex of initialComplexes) {
        const existingComplex = await residentialComplexRepository.findByUserIdAndName(user.id, complex.name);
        if (existingComplex) {
            continue;
        }
        await residentialComplexRepository.save({
            id: createId(),
            userId: user.id,
            createdAt: timestamp,
            updatedAt: timestamp,
            ...complex,
        });
    }
}
async function seed() {
    const userRepository = new UserRepository();
    const passwordService = new PasswordService();
    const email = "admin@convivar.com";
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        await seedComplexes(existingUser);
        console.log("El usuario administrador ya existe. Seed omitido.");
        return;
    }
    const timestamp = nowIsoString();
    const passwordHash = await passwordService.hash("Convivar2026!");
    const user = await userRepository.save({
        id: createId(),
        email,
        fullName: "Administrador Convivar",
        passwordHash,
        provider: "credentials",
        role: "Administrador",
        createdAt: timestamp,
        updatedAt: timestamp,
    });
    await seedComplexes(user);
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

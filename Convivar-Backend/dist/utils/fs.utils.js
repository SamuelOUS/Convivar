import fs from "node:fs/promises";
import { dirname } from "node:path";
export async function ensureDirectory(filePath) {
    await fs.mkdir(dirname(filePath), { recursive: true });
}
export async function readJsonFile(filePath, fallback) {
    try {
        const fileContents = await fs.readFile(filePath, "utf8");
        return JSON.parse(fileContents);
    }
    catch {
        return fallback;
    }
}
export async function writeJsonFile(filePath, data) {
    await ensureDirectory(filePath);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

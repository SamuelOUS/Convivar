import path from "node:path";
import { fileURLToPath } from "node:url";
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
export const projectRoot = path.resolve(currentDirPath, "..", "..");
export const dataDirectory = path.join(projectRoot, "data");
export const usersFilePath = path.join(dataDirectory, "users.json");

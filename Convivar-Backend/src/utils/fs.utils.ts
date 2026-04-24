import fs from "node:fs/promises";
import { dirname } from "node:path";

export async function ensureDirectory(filePath: string): Promise<void> {
  await fs.mkdir(dirname(filePath), { recursive: true });
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const fileContents = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContents) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDirectory(filePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

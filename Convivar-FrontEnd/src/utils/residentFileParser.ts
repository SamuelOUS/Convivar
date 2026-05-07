import * as XLSX from "xlsx";
import type {
  ImportResidentData,
  ResidentStatus,
  ResidentType,
} from "../types/residentialComplex";

type RawResidentRow = Record<string, unknown>;

const fullNameKeys = ["nombre", "nombre completo", "full name", "fullName", "name"];
const documentKeys = ["documento", "cedula", "cédula", "identificacion", "identificación", "documentNumber"];
const emailKeys = ["correo", "email", "correo electronico", "correo electrónico"];
const phoneKeys = ["telefono", "teléfono", "celular", "phone"];
const unitKeys = ["unidad", "apartamento", "apto", "casa", "torre", "unit", "unitLabel"];
const typeKeys = ["tipo", "tipo residente", "residentType"];
const statusKeys = ["estado", "status"];

function normalizeKey(key: string): string {
  return key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizeRow(row: RawResidentRow): Record<string, unknown> {
  return Object.entries(row).reduce<Record<string, unknown>>((accumulator, [key, value]) => {
    accumulator[normalizeKey(key)] = value;
    return accumulator;
  }, {});
}

function readValue(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = row[normalizeKey(key)];

    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return "";
}

function normalizeResidentType(value: string): ResidentType {
  const normalizedValue = normalizeKey(value);

  if (normalizedValue.includes("propietario")) {
    return "Propietario";
  }

  if (normalizedValue.includes("arrend")) {
    return "Arrendatario";
  }

  if (normalizedValue.includes("visit")) {
    return "Visitante";
  }

  return "Residente";
}

function normalizeStatus(value: string): ResidentStatus {
  return normalizeKey(value).includes("inactivo") ? "Inactivo" : "Activo";
}

function parseDelimitedText(text: string): RawResidentRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(delimiter).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((value) => value.trim());

    return headers.reduce<RawResidentRow>((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {});
  });
}

function normalizeResidents(rows: RawResidentRow[]): ImportResidentData[] {
  const residents: Array<ImportResidentData | null> = rows.map((rawRow) => {
      const row = normalizeRow(rawRow);
      const fullName = readValue(row, fullNameKeys);
      const unitLabel = readValue(row, unitKeys);

      if (!fullName || !unitLabel) {
        return null;
      }

      return {
        fullName,
        documentNumber: readValue(row, documentKeys) || null,
        email: readValue(row, emailKeys) || null,
        phone: readValue(row, phoneKeys) || null,
        unitLabel,
        residentType: normalizeResidentType(readValue(row, typeKeys)),
        status: normalizeStatus(readValue(row, statusKeys)),
      };
    });

  return residents.filter(
    (resident): resident is ImportResidentData => resident !== null,
  );
}

export async function parseResidentFile(file: File): Promise<ImportResidentData[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "xlsx" || extension === "xls") {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<RawResidentRow>(worksheet, {
      defval: "",
    });

    return normalizeResidents(rows);
  }

  const text = await file.text();

  if (extension === "json") {
    const payload = JSON.parse(text) as RawResidentRow[] | { residents?: RawResidentRow[] };
    return normalizeResidents(Array.isArray(payload) ? payload : payload.residents ?? []);
  }

  return normalizeResidents(parseDelimitedText(text));
}

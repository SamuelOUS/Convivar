import {
  Edit3,
  FileSpreadsheet,
  Filter,
  Search,
  Upload,
  Users,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { useResidentialComplex } from "../hooks/useResidentialComplex";
import {
  importResidents,
  listResidents,
  updateResident,
} from "../services/residents/residentService";
import type {
  Resident,
  ResidentFilters,
  ResidentPagination,
  ResidentStats,
  UpdateResidentData,
} from "../types/residentialComplex";
import { parseResidentFile } from "../utils/residentFileParser";
import styles from "./ResidentsPage.module.css";

const initialPagination: ResidentPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
};

const initialFilters: ResidentFilters = {
  status: "",
  unitLabel: "",
  residentType: "",
  registeredFrom: "",
  registeredTo: "",
};

const initialStats: ResidentStats = {
  total: 0,
  active: 0,
  inactive: 0,
  units: 0,
  owners: 0,
  tenants: 0,
  visitors: 0,
};

const importBatchSize = 300;

function toEditFormData(resident: Resident): UpdateResidentData {
  return {
    fullName: resident.fullName,
    documentNumber: resident.documentNumber,
    email: resident.email,
    phone: resident.phone,
    unitLabel: resident.unitLabel,
    residentType: resident.residentType,
    status: resident.status,
  };
}

function ResidentsPage() {
  const { authToken } = useAuth();
  const { refreshComplexes, selectedComplex } = useResidentialComplex();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [filters, setFilters] = useState<ResidentFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<ResidentFilters>(initialFilters);
  const [pagination, setPagination] =
    useState<ResidentPagination>(initialPagination);
  const [stats, setStats] = useState<ResidentStats>(initialStats);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateResidentData | null>(
    null,
  );
  const [isSavingResident, setIsSavingResident] = useState(false);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    const halfWindow = Math.floor(maxButtons / 2);
    const start = Math.max(1, pagination.page - halfWindow);
    const end = Math.min(pagination.totalPages, start + maxButtons - 1);
    const adjustedStart = Math.max(1, end - maxButtons + 1);

    return Array.from(
      { length: end - adjustedStart + 1 },
      (_, index) => adjustedStart + index,
    );
  }, [pagination.page, pagination.totalPages]);

  const hasAppliedFilters = useMemo(
    () =>
      Boolean(
        appliedSearch ||
          appliedFilters.status ||
          appliedFilters.unitLabel ||
          appliedFilters.residentType ||
          appliedFilters.registeredFrom ||
          appliedFilters.registeredTo,
      ),
    [appliedFilters, appliedSearch],
  );

  const loadResidents = useCallback(
    async (nextPage = 1): Promise<void> => {
      if (!authToken || !selectedComplex) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await listResidents(authToken, selectedComplex.id, {
          page: nextPage,
          pageSize: pagination.pageSize,
          search: appliedSearch,
          ...appliedFilters,
        });
        setResidents(response.residents);
        setPagination(response.pagination);
        setStats(response.stats);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No fue posible cargar los residentes.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      appliedFilters,
      appliedSearch,
      authToken,
      pagination.pageSize,
      selectedComplex,
    ],
  );

  useEffect(() => {
    void loadResidents(1);
  }, [loadResidents]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setAppliedSearch(search.trim());
    setAppliedFilters(filters);
  }

  function handleClearFilters(): void {
    setSearch("");
    setAppliedSearch("");
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }

  function handleFilterChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handlePageChange(nextPage: number): void {
    void loadResidents(nextPage);
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];

    if (!file || !authToken || !selectedComplex) {
      return;
    }

    setIsImporting(true);
    setError("");
    setStatusMessage("");

    try {
      const parsedResidents = await parseResidentFile(file);

      if (parsedResidents.length === 0) {
        throw new Error(
          "No se encontraron residentes validos. Usa columnas como nombre, unidad, documento, correo y telefono.",
        );
      }

      const totalBatches = Math.ceil(parsedResidents.length / importBatchSize);
      let imported = 0;
      let updated = 0;

      for (let index = 0; index < parsedResidents.length; index += importBatchSize) {
        const batch = parsedResidents.slice(index, index + importBatchSize);
        const currentBatch = Math.floor(index / importBatchSize) + 1;
        setStatusMessage(`Importando lote ${currentBatch} de ${totalBatches}...`);
        const response = await importResidents(authToken, selectedComplex.id, batch);
        imported += response.imported;
        updated += response.updated;
      }

      const nextResidents = await listResidents(authToken, selectedComplex.id, {
        page: 1,
        pageSize: pagination.pageSize,
        search: appliedSearch,
        ...appliedFilters,
      });
      setResidents(nextResidents.residents);
      setPagination(nextResidents.pagination);
      setStats(nextResidents.stats);
      await refreshComplexes();
      setStatusMessage(
        `${imported} residentes creados y ${updated} actualizados.`,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible importar el archivo.",
      );
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  }

  function handleEditClick(resident: Resident): void {
    setEditingResident(resident);
    setEditFormData(toEditFormData(resident));
    setError("");
    setStatusMessage("");
  }

  function handleEditChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const { name, value } = event.target;
    setEditFormData((current) =>
      current
        ? {
            ...current,
            [name]: value || null,
          }
        : current,
    );
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authToken || !selectedComplex || !editingResident || !editFormData) {
      return;
    }

    setIsSavingResident(true);
    setError("");
    setStatusMessage("");

    try {
      await updateResident(
        authToken,
        selectedComplex.id,
        editingResident.id,
        editFormData,
      );
      setEditingResident(null);
      setEditFormData(null);
      await loadResidents(pagination.page);
      setStatusMessage("Residente actualizado correctamente.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible actualizar el residente.",
      );
    } finally {
      setIsSavingResident(false);
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.iconWrap}>
          <Users size={28} />
        </div>
        <div>
          <p className={styles.eyebrow}>Modulo</p>
          <h1>Residentes</h1>
          <p>
            Base de residentes de {selectedComplex?.name}. Puedes importar datos
            desde Excel, CSV o JSON y consultarlos en esta vista.
          </p>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <article>
          <span>Total residentes</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>Activos</span>
          <strong>{stats.active}</strong>
        </article>
        <article>
          <span>Unidades relacionadas</span>
          <strong>{stats.units}</strong>
        </article>
        <article>
          <span>Inactivos</span>
          <strong>{stats.inactive}</strong>
        </article>
      </div>

      <div className={styles.importPanel}>
        <div>
          <p className={styles.eyebrow}>Importacion</p>
          <h2>Cargar base de residentes</h2>
          <p>
            Acepta archivos .xlsx, .xls, .csv y .json. Las columnas minimas son
            nombre y unidad.
          </p>
        </div>

        <label className={styles.uploadButton}>
          <Upload size={18} />
          {isImporting ? "Importando..." : "Seleccionar archivo"}
          <input
            accept=".xlsx,.xls,.csv,.json,text/csv,application/json"
            disabled={isImporting}
            onChange={handleFileChange}
            type="file"
          />
        </label>
      </div>

      {statusMessage ? <p className={styles.statusMessage}>{statusMessage}</p> : null}
      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      {editingResident && editFormData ? (
        <form className={styles.editPanel} onSubmit={handleEditSubmit}>
          <div className={styles.editHeader}>
            <div>
              <p className={styles.eyebrow}>Edicion</p>
              <h2>{editingResident.fullName}</h2>
            </div>
            <button
              className={styles.secondaryButton}
              onClick={() => {
                setEditingResident(null);
                setEditFormData(null);
              }}
              type="button"
            >
              Cancelar
            </button>
          </div>

          <label>
            Nombre
            <input
              name="fullName"
              onChange={handleEditChange}
              required
              value={editFormData.fullName}
            />
          </label>
          <label>
            Unidad
            <input
              name="unitLabel"
              onChange={handleEditChange}
              required
              value={editFormData.unitLabel}
            />
          </label>
          <label>
            Documento
            <input
              name="documentNumber"
              onChange={handleEditChange}
              value={editFormData.documentNumber ?? ""}
            />
          </label>
          <label>
            Correo
            <input
              name="email"
              onChange={handleEditChange}
              type="email"
              value={editFormData.email ?? ""}
            />
          </label>
          <label>
            Telefono
            <input
              name="phone"
              onChange={handleEditChange}
              value={editFormData.phone ?? ""}
            />
          </label>
          <label>
            Tipo
            <select
              name="residentType"
              onChange={handleEditChange}
              value={editFormData.residentType}
            >
              <option value="Propietario">Propietario</option>
              <option value="Arrendatario">Arrendatario</option>
              <option value="Residente">Residente</option>
              <option value="Visitante">Visitante</option>
            </select>
          </label>
          <label>
            Estado
            <select
              name="status"
              onChange={handleEditChange}
              value={editFormData.status}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </label>

          <button className={styles.saveButton} disabled={isSavingResident} type="submit">
            {isSavingResident ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      ) : null}

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <p className={styles.eyebrow}>Base de datos</p>
            <h2>Residentes cargados</h2>
          </div>
          <FileSpreadsheet size={22} />
        </div>

        <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
          <Search size={18} />
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, unidad, documento, correo, telefono..."
            value={search}
          />
          <button type="submit">Buscar</button>
          <button onClick={handleClearFilters} type="button">
            <X size={16} />
            Limpiar
          </button>
        </form>

        <form className={styles.filtersBar} onSubmit={handleSearchSubmit}>
          <div className={styles.filtersTitle}>
            <Filter size={18} />
            <span>Filtros</span>
          </div>
          <label>
            Estado
            <select name="status" onChange={handleFilterChange} value={filters.status}>
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </label>
          <label>
            Unidad
            <input
              name="unitLabel"
              onChange={handleFilterChange}
              placeholder="Apto 301, Torre 2..."
              value={filters.unitLabel}
            />
          </label>
          <label>
            Tipo
            <select
              name="residentType"
              onChange={handleFilterChange}
              value={filters.residentType}
            >
              <option value="">Todos</option>
              <option value="Propietario">Propietario</option>
              <option value="Arrendatario">Arrendatario</option>
              <option value="Residente">Residente</option>
              <option value="Visitante">Visitante</option>
            </select>
          </label>
          <label>
            Registro desde
            <input
              name="registeredFrom"
              onChange={handleFilterChange}
              type="date"
              value={filters.registeredFrom}
            />
          </label>
          <label>
            Registro hasta
            <input
              name="registeredTo"
              onChange={handleFilterChange}
              type="date"
              value={filters.registeredTo}
            />
          </label>
          <button type="submit">Aplicar filtros</button>
        </form>

        {hasAppliedFilters ? (
          <p className={styles.filterHint}>
            Mostrando {pagination.total} resultados para la busqueda y filtros activos.
          </p>
        ) : null}

        {isLoading ? <p className={styles.emptyState}>Cargando residentes...</p> : null}

        {!isLoading && residents.length === 0 ? (
          <p className={styles.emptyState}>
            Aun no hay residentes cargados para este conjunto.
          </p>
        ) : null}

        {residents.length > 0 ? (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Unidad</th>
                  <th>Documento</th>
                  <th>Correo</th>
                  <th>Telefono</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((resident) => (
                  <tr key={resident.id}>
                    <td>{resident.fullName}</td>
                    <td>{resident.unitLabel}</td>
                    <td>{resident.documentNumber ?? "-"}</td>
                    <td>{resident.email ?? "-"}</td>
                    <td>{resident.phone ?? "-"}</td>
                    <td>{resident.residentType}</td>
                    <td>
                      <span className={styles.badge}>{resident.status}</span>
                    </td>
                    <td>
                      <button
                        className={styles.iconButton}
                        onClick={() => handleEditClick(resident)}
                        type="button"
                      >
                        <Edit3 size={16} />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className={styles.pagination}>
          <span>
            {pagination.total} residentes - pagina {pagination.page} de{" "}
            {pagination.totalPages}
          </span>
          <div>
            <button
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => handlePageChange(pagination.page - 1)}
              type="button"
            >
              Anterior
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                aria-current={pageNumber === pagination.page ? "page" : undefined}
                className={
                  pageNumber === pagination.page ? styles.activePage : undefined
                }
                disabled={isLoading}
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                type="button"
              >
                {pageNumber}
              </button>
            ))}
            <button
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => handlePageChange(pagination.page + 1)}
              type="button"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResidentsPage;

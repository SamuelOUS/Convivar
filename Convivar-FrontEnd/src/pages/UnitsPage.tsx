import {
  Building2,
  Car,
  Filter,
  Home,
  PackageOpen,
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { useResidentialComplex } from "../hooks/useResidentialComplex";
import { getUnitsOverview } from "../services/units/unitService";
import type { FinancialAccountStatus } from "../types/finance";
import type { ManagedUnit, UnitGroup, UnitsOverview, UnitType } from "../types/unit";
import styles from "./UnitsPage.module.css";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  currency: "COP",
  maximumFractionDigits: 0,
  style: "currency",
});

const initialOverview: UnitsOverview = {
  groups: [],
  standaloneUnits: [],
  summary: {
    totalUnits: 0,
    apartments: 0,
    parkingSpaces: 0,
    storageRooms: 0,
    groupedApartments: 0,
    standaloneUnits: 0,
    totalBalance: 0,
  },
};

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function getStatusClass(status: FinancialAccountStatus): string {
  if (status === "Pendiente") {
    return styles.badgePending;
  }

  if (status === "En mora") {
    return styles.badgeOverdue;
  }

  return "";
}

function getUnitIcon(type: UnitType) {
  if (type === "Parqueadero") {
    return Car;
  }

  if (type === "Cuarto util") {
    return PackageOpen;
  }

  return Home;
}

function unitMatches(unit: ManagedUnit, search: string): boolean {
  return [
    unit.label,
    unit.type,
    unit.financialAccount.status,
    unit.residents.join(" "),
  ].some((value) => value.toLowerCase().includes(search));
}

function groupMatches(
  group: UnitGroup,
  search: string,
  statusFilter: "" | FinancialAccountStatus,
): boolean {
  const units = [
    ...(group.apartment ? [group.apartment] : []),
    ...group.associatedUnits,
  ];
  const matchesStatus = statusFilter ? group.status === statusFilter : true;
  const matchesSearch = search
    ? units.some((unit) => unitMatches(unit, search))
    : true;

  return matchesStatus && matchesSearch;
}

function UnitsPage() {
  const { authToken } = useAuth();
  const { selectedComplex } = useResidentialComplex();
  const selectedComplexId = selectedComplex?.id ?? null;
  const [overview, setOverview] = useState<UnitsOverview>(initialOverview);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | FinancialAccountStatus>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUnits = useCallback(async (): Promise<void> => {
    if (!authToken || !selectedComplexId) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await getUnitsOverview(authToken, selectedComplexId);
      setOverview(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible cargar las unidades.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [authToken, selectedComplexId]);

  useEffect(() => {
    void loadUnits();
  }, [loadUnits]);

  const normalizedSearch = appliedSearch.trim().toLowerCase();
  const filteredGroups = useMemo(
    () =>
      overview.groups.filter((group) =>
        groupMatches(group, normalizedSearch, statusFilter),
      ),
    [normalizedSearch, overview.groups, statusFilter],
  );
  const filteredStandaloneUnits = useMemo(
    () =>
      overview.standaloneUnits.filter((unit) => {
        const matchesStatus = statusFilter
          ? unit.financialAccount.status === statusFilter
          : true;
        const matchesSearch = normalizedSearch
          ? unitMatches(unit, normalizedSearch)
          : true;

        return matchesStatus && matchesSearch;
      }),
    [normalizedSearch, overview.standaloneUnits, statusFilter],
  );
  const visibleUnitsCount =
    filteredGroups.reduce(
      (total, group) => total + 1 + group.associatedUnits.length,
      0,
    ) + filteredStandaloneUnits.length;
  const isInitialLoading =
    isLoading &&
    overview.groups.length === 0 &&
    overview.standaloneUnits.length === 0;

  function handleApplyFilters(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setAppliedSearch(search);
  }

  function renderUnitCard(unit: ManagedUnit) {
    const Icon = getUnitIcon(unit.type);

    return (
      <article className={styles.unitCard} key={unit.id}>
        <div className={styles.unitIcon}>
          <Icon size={18} />
        </div>
        <div>
          <strong>{unit.label}</strong>
          <span>{unit.type}</span>
          <small>{unit.residents.join(", ") || "Sin residente activo"}</small>
        </div>
        <div className={styles.unitFinance}>
          <span className={`${styles.badge} ${getStatusClass(unit.financialAccount.status)}`}>
            {unit.financialAccount.status}
          </span>
          <strong>{formatCurrency(unit.financialAccount.balance)}</strong>
        </div>
      </article>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.iconWrap}>
          <Building2 size={28} />
        </div>
        <div>
          <p className={styles.eyebrow}>Modulo</p>
          <h1>Unidades</h1>
          <p>
            Representacion de apartamentos, parqueaderos y cuartos utiles de{" "}
            {selectedComplex?.name}, con sus carteras tomadas del modulo de
            finanzas.
          </p>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <article>
          <span>Total unidades</span>
          <strong>{overview.summary.totalUnits}</strong>
        </article>
        <article>
          <span>Apartamentos</span>
          <strong>{overview.summary.apartments}</strong>
        </article>
        <article>
          <span>Asociados</span>
          <strong>
            {overview.summary.parkingSpaces + overview.summary.storageRooms}
          </strong>
        </article>
        <article>
          <span>Saldo total</span>
          <strong>{formatCurrency(overview.summary.totalBalance)}</strong>
        </article>
      </div>

      <div className={styles.panel}>
        <form className={styles.filters} onSubmit={handleApplyFilters}>
          <label>
            Buscar
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Apartamento, residente, parqueadero..."
              value={search}
            />
          </label>
          <label>
            Estado cartera
            <select
              onChange={(event) =>
                setStatusFilter(event.target.value as "" | FinancialAccountStatus)
              }
              value={statusFilter}
            >
              <option value="">Todos</option>
              <option value="Al dia">Al dia</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En mora">En mora</option>
            </select>
          </label>
          <button className={styles.button} type="submit">
            <Search size={16} />
            Aplicar
          </button>
          <button
            className={styles.ghostButton}
            disabled={isLoading}
            onClick={() => void loadUnits()}
            type="button"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </form>
        <div className={styles.filterSummary}>
          <span>
            <Filter size={16} /> {visibleUnitsCount} unidades visibles
          </span>
          <span>
            <WalletCards size={16} /> {overview.summary.groupedApartments} apartamentos
            con asociadas
          </span>
        </div>
      </div>

      {error ? <p className={styles.errorMessage}>{error}</p> : null}
      {isInitialLoading ? (
        <p className={styles.emptyState}>Cargando unidades...</p>
      ) : null}
      {!isLoading &&
      overview.groups.length === 0 &&
      overview.standaloneUnits.length === 0 ? (
        <p className={styles.emptyState}>
          Aun no hay unidades con residentes activos para construir esta vista.
        </p>
      ) : null}

      {filteredGroups.length > 0 ? (
        <div className={styles.groupGrid}>
          {filteredGroups.map((group) => (
            <article className={styles.groupCard} key={group.id}>
              <div className={styles.groupHeader}>
                <div>
                  <p className={styles.eyebrow}>Apartamento</p>
                  <h2>{group.apartment?.label ?? "Unidad principal"}</h2>
                  <p>
                    {group.apartment?.residents.join(", ") ||
                      "Sin residente activo"}
                  </p>
                </div>
                <span className={`${styles.badge} ${getStatusClass(group.status)}`}>
                  {group.status}
                </span>
              </div>
              <div className={styles.financeStrip}>
                <span>
                  Cargos <strong>{formatCurrency(group.totalCharges)}</strong>
                </span>
                <span>
                  Pagos <strong>{formatCurrency(group.totalPayments)}</strong>
                </span>
                <span>
                  Saldo <strong>{formatCurrency(group.totalBalance)}</strong>
                </span>
              </div>
              {group.apartment ? renderUnitCard(group.apartment) : null}
              {group.associatedUnits.length > 0 ? (
                <div className={styles.associatedList}>
                  <h3>Unidades asociadas</h3>
                  {group.associatedUnits.map(renderUnitCard)}
                </div>
              ) : (
                <p className={styles.emptyState}>Sin parqueaderos o cuartos utiles asociados.</p>
              )}
            </article>
          ))}
        </div>
      ) : null}

      {filteredStandaloneUnits.length > 0 ? (
        <section className={styles.standalonePanel}>
          <div>
            <p className={styles.eyebrow}>Independientes</p>
            <h2>Unidades sin apartamento asociado</h2>
          </div>
          <div className={styles.standaloneGrid}>
            {filteredStandaloneUnits.map(renderUnitCard)}
          </div>
        </section>
      ) : null}
    </section>
  );
}

export default UnitsPage;

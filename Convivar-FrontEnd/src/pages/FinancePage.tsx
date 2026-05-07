import {
  CreditCard,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { useResidentialComplex } from "../hooks/useResidentialComplex";
import {
  createFinancialMovement,
  generateMonthlyCharges,
  getFinanceOverview,
} from "../services/finance/financeService";
import type {
  CreateFinancialMovementData,
  FinanceOverview,
  FinancialAccountStatus,
} from "../types/finance";
import styles from "./FinancePage.module.css";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  currency: "COP",
  maximumFractionDigits: 0,
  style: "currency",
});

const initialOverview: FinanceOverview = {
  accounts: [],
  summary: {
    totalUnits: 0,
    totalCharges: 0,
    totalPayments: 0,
    totalBalance: 0,
    overdueUnits: 0,
    collectionRate: 0,
  },
};

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
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

function FinancePage() {
  const { authToken } = useAuth();
  const { selectedComplex } = useResidentialComplex();
  const selectedComplexId = selectedComplex?.id ?? null;
  const [overview, setOverview] = useState<FinanceOverview>(initialOverview);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | FinancialAccountStatus>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [bulkCharge, setBulkCharge] = useState({
    amount: 185000,
    concept: "Cuota de administracion",
    movementDate: today(),
  });
  const [movementForm, setMovementForm] = useState<CreateFinancialMovementData>({
    accountId: "",
    movementType: "Pago",
    concept: "Pago de administracion",
    amount: 0,
    movementDate: today(),
    notes: "",
  });
  const isInitialLoading = isLoading && overview.accounts.length === 0;

  const loadFinances = useCallback(async (): Promise<void> => {
    if (!authToken || !selectedComplexId) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await getFinanceOverview(authToken, selectedComplexId);
      setOverview(response);
      setSelectedAccountId((current) => current ?? response.accounts[0]?.id ?? null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible cargar la cartera financiera.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [authToken, selectedComplexId]);

  useEffect(() => {
    void loadFinances();
  }, [loadFinances]);

  const selectedAccount = useMemo(
    () =>
      overview.accounts.find((account) => account.id === selectedAccountId) ??
      overview.accounts[0] ??
      null,
    [overview.accounts, selectedAccountId],
  );

  useEffect(() => {
    if (selectedAccount) {
      setMovementForm((current) => ({
        ...current,
        accountId: selectedAccount.id,
      }));
    }
  }, [selectedAccount]);

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = appliedSearch.trim().toLowerCase();

    return overview.accounts.filter((account) => {
      const matchesStatus = statusFilter ? account.status === statusFilter : true;
      const matchesSearch = normalizedSearch
        ? [
            account.unitLabel,
            account.status,
            account.residents.join(" "),
          ].some((value) => value.toLowerCase().includes(normalizedSearch))
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [appliedSearch, overview.accounts, statusFilter]);

  const statusChart = useMemo(
    () => [
      {
        label: "Al dia",
        value: overview.accounts.filter((account) => account.status === "Al dia")
          .length,
        className: styles.paidBar,
      },
      {
        label: "Pendiente",
        value: overview.accounts.filter((account) => account.status === "Pendiente")
          .length,
        className: styles.pendingBar,
      },
      {
        label: "En mora",
        value: overview.accounts.filter((account) => account.status === "En mora")
          .length,
        className: styles.overdueBar,
      },
    ],
    [overview.accounts],
  );
  const maxStatusValue = Math.max(
    1,
    ...statusChart.map((chartItem) => chartItem.value),
  );

  function handleApplyFilters(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setAppliedSearch(search);
  }

  function handleBulkChargeChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    setBulkCharge((current) => ({
      ...current,
      [name]: name === "amount" ? Math.max(0, Number(value)) : value,
    }));
  }

  function handleMovementChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const { name, value } = event.target;
    setMovementForm((current) => ({
      ...current,
      [name]: name === "amount" ? Math.max(0, Number(value)) : value,
    }));
  }

  async function handleGenerateCharges(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!authToken || !selectedComplexId) {
      return;
    }

    setIsSaving(true);
    setError("");
    setStatusMessage("");

    try {
      const response = await generateMonthlyCharges(authToken, selectedComplexId, {
        amount: bulkCharge.amount,
        concept: bulkCharge.concept,
        movementDate: bulkCharge.movementDate,
      });
      setStatusMessage(`${response.created} cargos generados por unidad.`);
      await loadFinances();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible generar los cargos.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateMovement(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!authToken || !selectedComplexId || !selectedAccount) {
      return;
    }

    setIsSaving(true);
    setError("");
    setStatusMessage("");

    try {
      await createFinancialMovement(authToken, selectedComplexId, {
        ...movementForm,
        accountId: selectedAccount.id,
      });
      setStatusMessage("Movimiento registrado correctamente.");
      setMovementForm((current) => ({
        ...current,
        amount: 0,
        notes: "",
      }));
      await loadFinances();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible registrar el movimiento.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleExportCsv(): void {
    const headers = [
      "Unidad",
      "Residentes",
      "Estado",
      "Cargos",
      "Pagos",
      "Saldo",
      "Ultimo movimiento",
    ];
    const rows = filteredAccounts.map((account) => [
      account.unitLabel,
      account.residents.join(" | "),
      account.status,
      account.charges,
      account.payments,
      account.balance,
      account.lastMovementDate ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cartera-${selectedComplex?.name ?? "conjunto"}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.iconWrap}>
          <CreditCard size={28} />
        </div>
        <div>
          <p className={styles.eyebrow}>Modulo</p>
          <h1>Finanzas</h1>
          <p>
            Cartera real por casa o unidad de {selectedComplex?.name}, con
            cargos, pagos, ajustes y estado de cuenta por unidad.
          </p>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <article>
          <span>Cargos acumulados</span>
          <strong>{formatCurrency(overview.summary.totalCharges)}</strong>
        </article>
        <article>
          <span>Pagos registrados</span>
          <strong>{formatCurrency(overview.summary.totalPayments)}</strong>
        </article>
        <article>
          <span>Saldo total</span>
          <strong>{formatCurrency(overview.summary.totalBalance)}</strong>
        </article>
        <article>
          <span>Recaudo</span>
          <strong>{overview.summary.collectionRate}%</strong>
        </article>
      </div>

      <div className={styles.chartGrid}>
        <section className={styles.chartPanel}>
          <div>
            <p className={styles.eyebrow}>Recaudo</p>
            <h2>Avance financiero</h2>
          </div>
          <div
            aria-label={`Recaudo del ${overview.summary.collectionRate}%`}
            className={styles.donut}
            style={
              {
                "--progress": `${overview.summary.collectionRate}%`,
              } as CSSProperties
            }
          >
            <strong>{overview.summary.collectionRate}%</strong>
            <span>recaudado</span>
          </div>
          <div className={styles.chartLegend}>
            <span>
              <i className={styles.legendCollected} />
              {formatCurrency(overview.summary.totalPayments)}
            </span>
            <span>
              <i className={styles.legendPending} />
              {formatCurrency(overview.summary.totalBalance)}
            </span>
          </div>
        </section>

        <section className={styles.chartPanel}>
          <div>
            <p className={styles.eyebrow}>Cartera</p>
            <h2>Unidades por estado</h2>
          </div>
          <div className={styles.barChart}>
            {statusChart.map((chartItem) => (
              <div className={styles.barRow} key={chartItem.label}>
                <span>{chartItem.label}</span>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${chartItem.className}`}
                    style={{
                      width: `${Math.max(
                        4,
                        (chartItem.value / maxStatusValue) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <strong>{chartItem.value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className={styles.panel}>
        <div>
          <p className={styles.eyebrow}>Cargos</p>
          <h2>Generar cargo masivo</h2>
          <p>
            Crea un cargo en la cartera de cada unidad activa. Cada pago o ajuste
            posterior queda registrado en el estado de cuenta de la unidad.
          </p>
        </div>
        <form className={styles.settingsGrid} onSubmit={handleGenerateCharges}>
          <label>
            Concepto
            <input
              name="concept"
              onChange={handleBulkChargeChange}
              value={bulkCharge.concept}
            />
          </label>
          <label>
            Valor por unidad
            <input
              min="0"
              name="amount"
              onChange={handleBulkChargeChange}
              step="1000"
              type="number"
              value={bulkCharge.amount}
            />
          </label>
          <label>
            Fecha
            <input
              name="movementDate"
              onChange={handleBulkChargeChange}
              type="date"
              value={bulkCharge.movementDate}
            />
          </label>
          <button className={styles.button} disabled={isSaving} type="submit">
            <Plus size={16} />
            Generar cargos
          </button>
        </form>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <p className={styles.eyebrow}>Cartera</p>
            <h2>Estados de cuenta por unidad</h2>
          </div>
          <WalletCards size={24} />
        </div>

        <form className={styles.filters} onSubmit={handleApplyFilters}>
          <label>
            Buscar
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Unidad, residente o estado..."
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
            onClick={() => void loadFinances()}
            type="button"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </form>

        <div className={styles.actions}>
          <button
            className={styles.ghostButton}
            disabled={filteredAccounts.length === 0}
            onClick={handleExportCsv}
            type="button"
          >
            <Download size={16} />
            Exportar CSV
          </button>
          <span>
            <Filter size={16} /> {filteredAccounts.length} unidades visibles
          </span>
        </div>

        {statusMessage ? (
          <p className={styles.statusMessage}>{statusMessage}</p>
        ) : null}
        {error ? <p className={styles.errorMessage}>{error}</p> : null}
        {isInitialLoading ? (
          <p className={styles.emptyState}>Cargando cartera...</p>
        ) : null}
        {!isLoading && overview.accounts.length === 0 ? (
          <p className={styles.emptyState}>
            Aun no hay unidades con residentes activos para construir cartera.
          </p>
        ) : null}

        {filteredAccounts.length > 0 ? (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Residentes</th>
                  <th>Estado</th>
                  <th>Cargos</th>
                  <th>Pagos</th>
                  <th>Saldo</th>
                  <th>Ultimo movimiento</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr
                    className={
                      selectedAccount?.id === account.id ? styles.selectedRow : ""
                    }
                    key={account.id}
                    onClick={() => setSelectedAccountId(account.id)}
                  >
                    <td>{account.unitLabel}</td>
                    <td>{account.residents.join(", ") || "-"}</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusClass(account.status)}`}>
                        {account.status}
                      </span>
                    </td>
                    <td>{formatCurrency(account.charges)}</td>
                    <td>{formatCurrency(account.payments)}</td>
                    <td>{formatCurrency(account.balance)}</td>
                    <td>{account.lastMovementDate ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {selectedAccount ? (
        <div className={styles.detailGrid}>
          <section className={styles.panel}>
            <div>
              <p className={styles.eyebrow}>Estado de cuenta</p>
              <h2>{selectedAccount.unitLabel}</h2>
              <p>{selectedAccount.residents.join(", ") || "Sin residente activo"}</p>
            </div>
            <form className={styles.movementForm} onSubmit={handleCreateMovement}>
              <label>
                Tipo
                <select
                  name="movementType"
                  onChange={handleMovementChange}
                  value={movementForm.movementType}
                >
                  <option value="Pago">Pago</option>
                  <option value="Cargo">Cargo</option>
                  <option value="Ajuste">Ajuste</option>
                </select>
              </label>
              <label>
                Concepto
                <input
                  name="concept"
                  onChange={handleMovementChange}
                  value={movementForm.concept}
                />
              </label>
              <label>
                Valor
                <input
                  min="0"
                  name="amount"
                  onChange={handleMovementChange}
                  step="1000"
                  type="number"
                  value={movementForm.amount}
                />
              </label>
              <label>
                Fecha
                <input
                  name="movementDate"
                  onChange={handleMovementChange}
                  type="date"
                  value={movementForm.movementDate}
                />
              </label>
              <label className={styles.fullSpan}>
                Notas
                <input
                  name="notes"
                  onChange={handleMovementChange}
                  value={movementForm.notes ?? ""}
                />
              </label>
              <button className={styles.button} disabled={isSaving} type="submit">
                Registrar movimiento
              </button>
            </form>
          </section>

          <section className={styles.panel}>
            <div>
              <p className={styles.eyebrow}>Movimientos</p>
              <h2>Historial financiero</h2>
            </div>
            {selectedAccount.movements.length === 0 ? (
              <p className={styles.emptyState}>Esta unidad no tiene movimientos.</p>
            ) : (
              <div className={styles.movementList}>
                {selectedAccount.movements.map((movement) => (
                  <article key={movement.id}>
                    <div>
                      <strong>{movement.concept}</strong>
                      <span>
                        {movement.movementType} · {movement.movementDate}
                      </span>
                      {movement.notes ? <span>{movement.notes}</span> : null}
                    </div>
                    <strong>{formatCurrency(movement.amount)}</strong>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}

export default FinancePage;

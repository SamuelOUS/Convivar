import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  CreditCard,
  ReceiptText,
  RefreshCw,
  Users,
  WalletCards,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { useResidentialComplex } from "../hooks/useResidentialComplex";
import { getFinanceOverview } from "../services/finance/financeService";
import { listResidents } from "../services/residents/residentService";
import type {
  FinanceOverview,
  FinancialMovement,
  UnitFinancialAccount,
} from "../types/finance";
import type { ResidentStats } from "../types/residentialComplex";
import styles from "./Dashboard.module.css";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  currency: "COP",
  maximumFractionDigits: 0,
  style: "currency",
});

const initialFinanceOverview: FinanceOverview = {
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

const initialResidentStats: ResidentStats = {
  total: 0,
  active: 0,
  inactive: 0,
  units: 0,
  owners: 0,
  tenants: 0,
  visitors: 0,
};

type PaymentWithAccount = FinancialMovement & {
  unitLabel: string;
  residents: string[];
};

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function isAdministrationPayment(movement: FinancialMovement): boolean {
  const concept = movement.concept
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return (
    movement.movementType === "Pago" &&
    (concept.includes("administracion") || concept.includes("cuota"))
  );
}

function getRecentPayments(accounts: UnitFinancialAccount[]): PaymentWithAccount[] {
  const payments = accounts.flatMap((account) =>
    account.movements
      .filter((movement) => movement.movementType === "Pago")
      .map((movement) => ({
        ...movement,
        unitLabel: account.unitLabel,
        residents: account.residents,
      })),
  );
  const administrationPayments = payments.filter(isAdministrationPayment);
  const sourcePayments =
    administrationPayments.length > 0 ? administrationPayments : payments;

  return sourcePayments
    .sort((first, second) => {
      const secondDate = new Date(second.movementDate).getTime();
      const firstDate = new Date(first.movementDate).getTime();

      if (secondDate !== firstDate) {
        return secondDate - firstDate;
      }

      return (
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
      );
    })
    .slice(0, 5);
}

function Dashboard() {
  const { authToken, currentUser } = useAuth();
  const { selectedComplex } = useResidentialComplex();
  const selectedComplexId = selectedComplex?.id ?? null;
  const [financeOverview, setFinanceOverview] = useState<FinanceOverview>(
    initialFinanceOverview,
  );
  const [residentStats, setResidentStats] =
    useState<ResidentStats>(initialResidentStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (): Promise<void> => {
    if (!authToken || !selectedComplexId) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [financeResponse, residentResponse] = await Promise.all([
        getFinanceOverview(authToken, selectedComplexId),
        listResidents(authToken, selectedComplexId, {
          page: 1,
          pageSize: 5,
          search: "",
          status: "",
          unitLabel: "",
          residentType: "",
          registeredFrom: "",
          registeredTo: "",
        }),
      ]);

      setFinanceOverview(financeResponse);
      setResidentStats(residentResponse.stats);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible cargar el resumen del dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [authToken, selectedComplexId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const recentPayments = useMemo(
    () => getRecentPayments(financeOverview.accounts),
    [financeOverview.accounts],
  );
  const accountsByStatus = useMemo(
    () => [
      {
        label: "Al dia",
        value: financeOverview.accounts.filter(
          (account) => account.status === "Al dia",
        ).length,
        className: styles.paidBar,
      },
      {
        label: "Pendiente",
        value: financeOverview.accounts.filter(
          (account) => account.status === "Pendiente",
        ).length,
        className: styles.pendingBar,
      },
      {
        label: "En mora",
        value: financeOverview.accounts.filter(
          (account) => account.status === "En mora",
        ).length,
        className: styles.overdueBar,
      },
    ],
    [financeOverview.accounts],
  );
  const maxStatusValue = Math.max(
    1,
    ...accountsByStatus.map((status) => status.value),
  );
  const residentsActiveRate =
    residentStats.total > 0
      ? Math.round((residentStats.active / residentStats.total) * 100)
      : 0;
  const dashboardCards = [
    {
      icon: Building2,
      title: `${financeOverview.summary.totalUnits || residentStats.units} unidades`,
      description: "Unidades con cartera sincronizada desde la base de residentes.",
    },
    {
      icon: Users,
      title: `${residentStats.active} activos`,
      description: `${residentStats.total} residentes historicos en total.`,
    },
    {
      icon: CreditCard,
      title: `${financeOverview.summary.collectionRate}% recaudo`,
      description: `${formatCurrency(financeOverview.summary.totalPayments)} pagados.`,
    },
    {
      icon: AlertTriangle,
      title: `${financeOverview.summary.overdueUnits} unidades en mora`,
      description: `${formatCurrency(financeOverview.summary.totalBalance)} de saldo pendiente.`,
    },
  ];

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Panel principal</p>
          <h1>{selectedComplex?.name}</h1>
          <p className={styles.description}>
            Hola, {currentUser?.fullName}. Estas viendo el estado general de{" "}
            {selectedComplex?.name}: cartera, residentes activos y actividad
            reciente de pagos.
          </p>
        </div>
        <button
          className={styles.refreshButton}
          disabled={isLoading}
          onClick={() => void loadDashboard()}
          type="button"
        >
          <RefreshCw size={16} />
          {isLoading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      <div className={styles.grid}>
        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <article className={styles.card} key={card.title}>
              <div className={styles.cardIcon}>
                <Icon size={20} />
              </div>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
            </article>
          );
        })}
      </div>

      <div className={styles.dashboardGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrowDark}>Cartera</p>
              <h2>Estado financiero</h2>
            </div>
            <WalletCards size={24} />
          </div>
          <div
            aria-label={`Recaudo del ${financeOverview.summary.collectionRate}%`}
            className={styles.donut}
            style={
              {
                "--progress": `${financeOverview.summary.collectionRate}%`,
              } as CSSProperties
            }
          >
            <strong>{financeOverview.summary.collectionRate}%</strong>
            <span>recaudo</span>
          </div>
          <div className={styles.financeTotals}>
            <span>
              Cargos <strong>{formatCurrency(financeOverview.summary.totalCharges)}</strong>
            </span>
            <span>
              Pagos <strong>{formatCurrency(financeOverview.summary.totalPayments)}</strong>
            </span>
            <span>
              Saldo <strong>{formatCurrency(financeOverview.summary.totalBalance)}</strong>
            </span>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrowDark}>Residentes</p>
              <h2>Actividad residencial</h2>
            </div>
            <CheckCircle2 size={24} />
          </div>
          <div className={styles.residentMeter}>
            <strong>{residentsActiveRate}%</strong>
            <span>residentes activos</span>
          </div>
          <div className={styles.residentStats}>
            <span>Activos: {residentStats.active}</span>
            <span>Inactivos: {residentStats.inactive}</span>
            <span>Propietarios: {residentStats.owners}</span>
            <span>Arrendatarios: {residentStats.tenants}</span>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrowDark}>Unidades</p>
              <h2>Cartera por estado</h2>
            </div>
            <CreditCard size={24} />
          </div>
          <div className={styles.barChart}>
            {accountsByStatus.map((status) => (
              <div className={styles.barRow} key={status.label}>
                <span>{status.label}</span>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${status.className}`}
                    style={{
                      width: `${Math.max(
                        4,
                        (status.value / maxStatusValue) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <strong>{status.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrowDark}>Pagos</p>
              <h2>Ultimos pagos de administracion</h2>
            </div>
            <ReceiptText size={24} />
          </div>
          {recentPayments.length === 0 ? (
            <p className={styles.emptyState}>
              Aun no hay pagos registrados en la cartera.
            </p>
          ) : (
            <div className={styles.paymentList}>
              {recentPayments.map((payment) => (
                <article key={payment.id}>
                  <div>
                    <strong>{payment.unitLabel}</strong>
                    <span>
                      {payment.residents.join(", ") || "Sin residente asociado"}
                    </span>
                    <small>
                      {payment.concept} - {formatDate(payment.movementDate)}
                    </small>
                  </div>
                  <strong>{formatCurrency(payment.amount)}</strong>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default Dashboard;

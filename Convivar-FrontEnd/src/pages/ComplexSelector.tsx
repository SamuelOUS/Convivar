import {
  ArrowRight,
  Building2,
  CalendarDays,
  CreditCard,
  LogOut,
  Wrench,
} from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useResidentialComplex } from "../hooks/useResidentialComplex";
import type { CreateResidentialComplexData } from "../types/residentialComplex";
import styles from "./ComplexSelector.module.css";

const initialFormState: CreateResidentialComplexData = {
  name: "",
  address: "",
  administrator: "",
  status: "Activo",
  units: 0,
  residents: 0,
  collectionRate: 0,
  weeklyReservations: 0,
  openMaintenance: 0,
};

function ComplexSelector() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const {
    complexes,
    createComplex,
    error,
    isLoading,
    selectComplex,
    selectedComplex,
  } = useResidentialComplex();
  const [formData, setFormData] =
    useState<CreateResidentialComplexData>(initialFormState);
  const [formError, setFormError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  function handleSelect(complexId: string): void {
    selectComplex(complexId);
    navigate("/", { replace: true });
  }

  function handleLogout(): void {
    logout();
    navigate("/login", { replace: true });
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const { name, value } = event.target;
    const numericFields = [
      "units",
      "residents",
      "collectionRate",
      "weeklyReservations",
      "openMaintenance",
    ];

    setFormData((current) => ({
      ...current,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
    setFormError("");
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!formData.name.trim() || !formData.address.trim()) {
      setFormError("Ingresa al menos nombre y direccion del conjunto.");
      return;
    }

    setIsCreating(true);
    setFormError("");

    try {
      await createComplex(formData);
      setFormData(initialFormState);
      navigate("/", { replace: true });
    } catch (requestError) {
      setFormError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible crear el conjunto.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Seleccion de conjunto</p>
          <h1>Escoge el conjunto residencial a administrar</h1>
          <p>
            Hola, {currentUser?.fullName}. Cada conjunto abre su propio panel,
            metricas y modulos operativos.
          </p>
        </div>
        <button className={styles.logoutButton} onClick={handleLogout} type="button">
          <LogOut size={18} />
          Cerrar sesion
        </button>
      </section>

      <section className={styles.grid} aria-label="Conjuntos residenciales">
        {isLoading ? <p className={styles.stateMessage}>Cargando conjuntos...</p> : null}
        {error ? <p className={styles.errorMessage}>{error}</p> : null}
        {!isLoading && !error && complexes.length === 0 ? (
          <p className={styles.stateMessage}>
            Debes crear un conjunto para poder administrarlo. Si el conjunto ya
            existe, contacta con el proveedor del servicio.
          </p>
        ) : null}

        {complexes.map((complex) => {
          const isSelected = selectedComplex?.id === complex.id;

          return (
            <article className={styles.card} key={complex.id}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrap}>
                  <Building2 size={22} />
                </div>
                <span className={styles.status}>{complex.status}</span>
              </div>

              <h2>{complex.name}</h2>
              <p className={styles.address}>{complex.address}</p>
              <p className={styles.admin}>{complex.administrator}</p>

              <div className={styles.metrics}>
                <span>
                  <Building2 size={16} />
                  {complex.metrics.units} unidades
                </span>
                <span>
                  <CreditCard size={16} />
                  {complex.metrics.collectionRate}% recaudo
                </span>
                <span>
                  <CalendarDays size={16} />
                  {complex.metrics.weeklyReservations} reservas
                </span>
                <span>
                  <Wrench size={16} />
                  {complex.metrics.openMaintenance} casos
                </span>
              </div>

              <button
                className={styles.selectButton}
                onClick={() => handleSelect(complex.id)}
                type="button"
              >
                {isSelected ? "Continuar analizando" : "Abrir conjunto"}
                <ArrowRight size={17} />
              </button>
            </article>
          );
        })}
      </section>

      <section className={styles.createPanel}>
        <div>
          <p className={styles.eyebrow}>Nuevo conjunto</p>
          <h2>Agregar conjunto residencial</h2>
          <p>
            El conjunto se guarda en PostgreSQL y queda disponible para el
            administrador autenticado.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleCreate}>
          <label>
            Nombre
            <input
              name="name"
              onChange={handleChange}
              placeholder="Torres de Alameda"
              type="text"
              value={formData.name}
            />
          </label>

          <label>
            Direccion
            <input
              name="address"
              onChange={handleChange}
              placeholder="Calle 20 #14-30"
              type="text"
              value={formData.address}
            />
          </label>

          <label>
            Administrador
            <input
              name="administrator"
              onChange={handleChange}
              placeholder="Equipo administrativo"
              type="text"
              value={formData.administrator}
            />
          </label>

          <label>
            Estado
            <select name="status" onChange={handleChange} value={formData.status}>
              <option value="Activo">Activo</option>
              <option value="En revision">En revision</option>
            </select>
          </label>

          <label>
            Unidades
            <input
              min="0"
              name="units"
              onChange={handleChange}
              type="number"
              value={formData.units}
            />
          </label>

          <label>
            Residentes
            <input
              min="0"
              name="residents"
              onChange={handleChange}
              type="number"
              value={formData.residents}
            />
          </label>

          <label>
            Recaudo %
            <input
              max="100"
              min="0"
              name="collectionRate"
              onChange={handleChange}
              type="number"
              value={formData.collectionRate}
            />
          </label>

          <label>
            Reservas semana
            <input
              min="0"
              name="weeklyReservations"
              onChange={handleChange}
              type="number"
              value={formData.weeklyReservations}
            />
          </label>

          <label>
            Mantenimientos
            <input
              min="0"
              name="openMaintenance"
              onChange={handleChange}
              type="number"
              value={formData.openMaintenance}
            />
          </label>

          {formError ? <p className={styles.errorMessage}>{formError}</p> : null}

          <button className={styles.createButton} disabled={isCreating} type="submit">
            {isCreating ? "Guardando..." : "Crear y abrir conjunto"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ComplexSelector;

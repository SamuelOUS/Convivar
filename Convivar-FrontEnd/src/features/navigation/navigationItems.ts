import {
  Building2,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Users,
  Wrench,
} from "lucide-react";
import type { NavigationItem } from "../../types/navigation";

export const navigationItems: NavigationItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
    description: "Vista general de indicadores, actividad reciente y accesos directos.",
  },
  {
    icon: Building2,
    label: "Unidades",
    path: "/unidades",
    description: "Administracion de apartamentos, parqueaderos y estado de ocupacion.",
  },
  {
    icon: Users,
    label: "Residentes",
    path: "/residentes",
    description: "Gestion de residentes, contactos y relacion con cada unidad.",
  },
  {
    icon: CreditCard,
    label: "Finanzas",
    path: "/finanzas",
    description: "Seguimiento de cartera, recaudos y movimientos administrativos.",
  },
  {
    icon: Wrench,
    label: "Mantenimiento",
    path: "/mantenimiento",
    description: "Registro de solicitudes, incidencias y estado de los trabajos.",
  },
  {
    icon: CalendarDays,
    label: "Reservas",
    path: "/reservas",
    description: "Control de agenda para zonas comunes, turnos y disponibilidad.",
  },
  {
    icon: MessageSquare,
    label: "Comunicados",
    path: "/comunicados",
    description: "Publicacion de novedades, anuncios internos y mensajes a residentes.",
  },
];

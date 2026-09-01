import { addDays, startOfWeek, toISODate } from "./date";
import type {
  AppState,
  Booking,
  ClassSession,
  Coach,
  DayConfig,
  Metrica,
  Pilar,
  Promocion,
  User,
} from "./types";

export const COACHES: Coach[] = [
  {
    id: "cch-1",
    nombre: "Cecilia De La Torre",
    especialidad: "Entrenamiento funcional integral",
    bio: "Fundadora y entrenadora principal de UNIUM. Diseña y guía cada sesión del estudio.",
    activa: true,
    creadaEn: new Date().toISOString(),
  },
];

/**
 * Fotografias del estudio. Copia los archivos en `public/fotos/` con estos
 * nombres exactos; mientras no existan, el componente <Foto> dibuja un
 * marcador con la marca en lugar de una imagen rota.
 */
export const FOTOS = {
  claseGrupal: {
    src: "/fotos/clase-grupal.jpg",
    alt: "Grupo de alumnas en posición de plancha durante una clase en el estudio UNIUM",
  },
  fuerza: {
    src: "/fotos/entrenamiento-fuerza.jpg",
    alt: "Alumna trabajando press de hombros con mancuernas frente al espejo del estudio",
  },
  sala: {
    src: "/fotos/sala-estudio.jpg",
    alt: "Sala principal del estudio UNIUM con equipamiento y luz cálida",
  },
} as const;

export const ESTUDIO = {
  nombre: "UNIUM Wellness Training",
  lema: "Unidos somos más fuertes",
  direccion: "Calle 93B #13-45, Chicó Norte",
  ciudad: "Bogotá, Colombia",
  telefono: "+57 320 448 9012",
  email: "hola@unium.fit",
  instagram: "@unium.wellness",
  mapa: "https://www.openstreetmap.org/export/embed.html?bbox=-74.0530%2C4.6720%2C-74.0400%2C4.6800&layer=mapnik&marker=4.6760%2C-74.0465",
};

/** "Los cuatro pilares" del método, mostrados en la landing y editables desde /admin/configuracion. */
export const PILARES_INICIALES: Pilar[] = [
  {
    id: "plr-1",
    icono: "fitness_center",
    titulo: "Fuerza con técnica",
    texto:
      "Progresiones medidas, cargas conscientes y corrección constante. Cada bloque se construye sobre el anterior.",
    orden: 0,
  },
  {
    id: "plr-2",
    icono: "self_improvement",
    titulo: "Movilidad y core",
    texto:
      "Respiración, control profundo y rangos articulares reales. La base sobre la que se sostiene la fuerza.",
    orden: 1,
  },
  {
    id: "plr-3",
    icono: "monitor_heart",
    titulo: "Intensidad medida",
    texto:
      "Intervalos diseñados con control de ritmo cardiaco y recuperación activa. Intensidad, nunca improvisación.",
    orden: 2,
  },
  {
    id: "plr-4",
    icono: "diversity_3",
    titulo: "Grupos reducidos",
    texto:
      "Máximo 12 alumnas por sesión para que la coach acompañe cada repetición. Unidos somos más fuertes.",
    orden: 3,
  },
];

const CONFIG_INICIAL: DayConfig[] = [
  { day: 0, activo: true, apertura: "05:30", cierre: "20:00" },
  { day: 1, activo: true, apertura: "05:30", cierre: "20:00" },
  { day: 2, activo: true, apertura: "05:30", cierre: "20:00" },
  { day: 3, activo: true, apertura: "05:30", cierre: "20:00" },
  { day: 4, activo: true, apertura: "06:00", cierre: "18:00" },
  { day: 5, activo: true, apertura: "07:00", cierre: "12:00" },
  { day: 6, activo: false, apertura: "08:00", cierre: "11:00" },
];

export const CLASES: ClassSession[] = [
  {
    id: "cls-01",
    titulo: "Fuerza Total",
    descripcion:
      "Bloque de fuerza con barra y mancuernas. Patrones de empuje, tracción y bisagra de cadera con progresión semanal.",
    day: 0,
    hora: "06:00",
    duracion: 60,
    coachId: COACHES[0].id,
    cupo: 12,
    semanal: true,
    fecha: null,
  },
  {
    id: "cls-02",
    titulo: "Core & Movilidad",
    descripcion:
      "Trabajo de control profundo, respiración y rangos articulares. Ideal como sesión de recuperación activa.",
    day: 0,
    hora: "18:30",
    duracion: 50,
    coachId: COACHES[0].id,
    cupo: 10,
    semanal: true,
    fecha: null,
  },
  {
    id: "cls-03",
    titulo: "HIIT Premium",
    descripcion:
      "Intervalos de alta intensidad con control de ritmo cardiaco. Potencia, resistencia y recuperación medida.",
    day: 1,
    hora: "07:00",
    duracion: 45,
    coachId: COACHES[0].id,
    cupo: 14,
    semanal: true,
    fecha: null,
  },
  {
    id: "cls-04",
    titulo: "Fuerza Total",
    descripcion:
      "Bloque de fuerza con barra y mancuernas. Patrones de empuje, tracción y bisagra de cadera con progresión semanal.",
    day: 1,
    hora: "19:00",
    duracion: 60,
    coachId: COACHES[0].id,
    cupo: 12,
    semanal: true,
    fecha: null,
  },
  {
    id: "cls-05",
    titulo: "Glúteo & Pierna",
    descripcion:
      "Sesión enfocada en cadena posterior: sentadilla, peso muerto, hip thrust y accesorios de estabilidad.",
    day: 2,
    hora: "06:00",
    duracion: 60,
    coachId: COACHES[0].id,
    cupo: 12,
    semanal: true,
    fecha: null,
  },
  {
    id: "cls-06",
    titulo: "Core & Movilidad",
    descripcion:
      "Trabajo de control profundo, respiración y rangos articulares. Ideal como sesión de recuperación activa.",
    day: 2,
    hora: "18:00",
    duracion: 50,
    coachId: COACHES[0].id,
    cupo: 10,
    semanal: true,
    fecha: null,
  },
  {
    id: "cls-07",
    titulo: "HIIT Premium",
    descripcion:
      "Intervalos de alta intensidad con control de ritmo cardiaco. Potencia, resistencia y recuperación medida.",
    day: 3,
    hora: "07:00",
    duracion: 45,
    coachId: COACHES[0].id,
    cupo: 14,
    semanal: true,
    fecha: null,
  },
  {
    id: "cls-08",
    titulo: "Fuerza Total",
    descripcion:
      "Bloque de fuerza con barra y mancuernas. Patrones de empuje, tracción y bisagra de cadera con progresión semanal.",
    day: 3,
    hora: "19:00",
    duracion: 60,
    coachId: COACHES[0].id,
    cupo: 12,
    semanal: true,
    fecha: null,
  },
  {
    id: "cls-09",
    titulo: "Full Body Express",
    descripcion:
      "Circuito completo de 45 minutos para cerrar la semana. Intensidad moderada y mucho trabajo de patrón global.",
    day: 4,
    hora: "06:30",
    duracion: 45,
    coachId: COACHES[0].id,
    cupo: 14,
    semanal: true,
    fecha: null,
  },
  {
    id: "cls-10",
    titulo: "Sábado Comunidad",
    descripcion:
      "Entrenamiento en parejas y equipos. La sesión más social de la semana, abierta a invitadas.",
    day: 5,
    hora: "09:00",
    duracion: 60,
    coachId: COACHES[0].id,
    cupo: 16,
    semanal: true,
    fecha: null,
  },
];

/** Cifras destacadas del hero de la landing, editables desde /admin/configuracion. */
export const METRICAS_INICIALES: Metrica[] = [
  { id: "mtr-1", valor: "12", etiqueta: "Alumnas por clase", orden: 0 },
  { id: "mtr-2", valor: "6", etiqueta: "Días de operación", orden: 1 },
  { id: "mtr-3", valor: "45'", etiqueta: "Sesión promedio", orden: 2 },
  { id: "mtr-4", valor: "100%", etiqueta: "Entrenamiento guiado", orden: 3 },
];

const ALUMNAS: Array<Pick<User, "nombre" | "email" | "telefono"> & { activa: boolean }> = [
  { nombre: "Mariana Gómez", email: "mariana@unium.fit", telefono: "+57 310 552 1188", activa: true },
  { nombre: "Laura Restrepo", email: "laura@unium.fit", telefono: "+57 311 664 2044", activa: true },
  { nombre: "Isabella Cárdenas", email: "isabella@unium.fit", telefono: "+57 312 771 9033", activa: true },
  { nombre: "Sofía Villamil", email: "sofia@unium.fit", telefono: "+57 313 880 5521", activa: true },
  { nombre: "Andrea Pineda", email: "andrea@unium.fit", telefono: "+57 314 220 7710", activa: false },
  { nombre: "Juliana Torres", email: "juliana@unium.fit", telefono: "+57 315 331 6604", activa: true },
];

/** Cuenta de demostracion que se usa en el acceso rapido del login. */
export const CUENTA_DEMO = { email: "mariana@unium.fit", password: "unium123" };
export const CUENTA_ADMIN = { email: "admin@unium.fit", password: "unium123" };

function promocionesIniciales(hoy: Date): Promocion[] {
  const desde = (d: number) => toISODate(addDays(hoy, d));
  return [
    {
      id: "prm-1",
      titulo: "Trae a una amiga",
      descripcion:
        "Durante septiembre puedes invitar a una amiga a cualquier clase de la semana sin costo. Solo reserva tu cupo y avísanos en recepción.",
      etiqueta: "2X1",
      desde: desde(-3),
      hasta: desde(25),
      activa: true,
      enInicio: true,
      notificar: true,
      creadaEn: new Date().toISOString(),
    },
    {
      id: "prm-2",
      titulo: "Semana de movilidad",
      descripcion:
        "Sumamos una sesión extra de Core & Movilidad los miércoles a las 07:00. Cupos limitados a 10 alumnas.",
      etiqueta: "NUEVA CLASE",
      desde: desde(-1),
      hasta: desde(12),
      activa: true,
      enInicio: true,
      notificar: true,
      creadaEn: new Date().toISOString(),
    },
    {
      id: "prm-3",
      titulo: "Madrugadoras",
      descripcion:
        "Las clases de 05:30 y 06:00 tienen prioridad de reserva para quienes asistan tres veces por semana.",
      etiqueta: "BENEFICIO",
      desde: desde(-10),
      hasta: desde(40),
      activa: true,
      enInicio: false,
      notificar: false,
      creadaEn: new Date().toISOString(),
    },
  ];
}

export function crearEstadoInicial(): AppState {
  const users: User[] = [
    {
      id: "usr-admin",
      nombre: "Staff UNIUM",
      email: CUENTA_ADMIN.email,
      telefono: ESTUDIO.telefono,
      password: CUENTA_ADMIN.password,
      role: "admin",
      activa: true,
      creadaEn: new Date().toISOString(),
    },
    ...ALUMNAS.map((a, i) => ({
      id: `usr-${i + 1}`,
      nombre: a.nombre,
      email: a.email,
      telefono: a.telefono,
      password: "unium123",
      role: "alumna" as const,
      activa: a.activa,
      creadaEn: new Date().toISOString(),
    })),
  ];

  const lunes = startOfWeek(new Date());
  const bookings: Booking[] = [];
  let n = 0;

  const inscritas = users.filter((u) => u.role === "alumna");

  // Historial de las dos semanas previas + reservas de la semana en curso.
  // Las alumnas rotan por clase para que la ocupacion no sea uniforme.
  for (const semana of [-2, -1, 0]) {
    CLASES.forEach((clase, idx) => {
      const fecha = toISODate(addDays(lunes, semana * 7 + clase.day));
      const cuantas = ((idx + semana + 9) % 4) + 2;
      const inicio = (idx * 2 + semana + 12) % inscritas.length;
      for (let k = 0; k < cuantas; k++) {
        const alumna = inscritas[(inicio + k) % inscritas.length];
        if (!alumna.activa && semana === 0) continue;
        bookings.push({
          id: `bkg-${++n}`,
          classId: clase.id,
          userId: alumna.id,
          fecha,
          asistio: semana < 0,
          creadaEn: new Date().toISOString(),
        });
      }
    });
  }

  return {
    users,
    config: CONFIG_INICIAL,
    classes: CLASES,
    bookings,
    promociones: promocionesIniciales(new Date()),
    coaches: COACHES,
    estudio: ESTUDIO,
    pilares: PILARES_INICIALES,
    metricas: METRICAS_INICIALES,
    cancelaciones: [],
    listaEspera: [],
    leidas: {},
    sessionUserId: null,
  };
}

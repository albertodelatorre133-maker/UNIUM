"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { COACHES, ESTUDIO, METRICAS_INICIALES, PILARES_INICIALES, crearEstadoInicial } from "./seed";
import type {
  AppState,
  Booking,
  ClassSession,
  Coach,
  DayConfig,
  Estudio,
  Metrica,
  Pilar,
  Promocion,
  User,
} from "./types";
import { addDays, dayIndex, fromISODate, hoyISO, startOfWeek, toISODate } from "./date";
import { clienteNavegador, hayBaseDeDatos } from "./supabase/cliente";
import { aReserva, aUsuario } from "./datos/comun";
import * as datosAuth from "./datos/auth";
import * as datosConfig from "./datos/configuracion";
import * as datosClases from "./datos/clases";
import * as datosReservas from "./datos/reservas";
import * as datosPromos from "./datos/promociones";
import * as datosCoaches from "./datos/coaches";
import * as datosEstudio from "./datos/estudio";
import * as datosPilares from "./datos/pilares";
import * as datosMetricas from "./datos/metricas";
import { cambiarEstadoAlumna as cambiarEstadoAlumnaRemoto } from "./datos/alumnas";

const STORAGE_KEY = "unium.state.v2";

export interface NotificacionPromo {
  promocion: Promocion;
  leida: boolean;
}

export interface SesionDelDia {
  clase: ClassSession;
  fecha: string;
  reservadas: number;
  disponibles: number;
  reservaPropia: Booking | null;
  pasada: boolean;
}

interface StoreValue {
  hidratado: boolean;
  state: AppState;
  usuario: User | null;
  alumnas: User[];
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string; role?: User["role"] }>;
  registrar: (datos: {
    nombre: string;
    email: string;
    telefono: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string; sesionActiva?: boolean }>;
  salir: () => Promise<void>;
  solicitarRecuperacion: (email: string) => Promise<{ ok: boolean; error?: string }>;
  restablecerPassword: (password: string) => Promise<{ ok: boolean; error?: string }>;
  guardarConfig: (config: DayConfig[]) => Promise<void>;
  guardarEstudio: (cambios: Partial<Estudio>) => Promise<void>;
  crearPilar: (pilar: Omit<Pilar, "id">) => Promise<void>;
  actualizarPilar: (id: string, cambios: Partial<Pilar>) => Promise<void>;
  eliminarPilar: (id: string) => Promise<void>;
  crearMetrica: (metrica: Omit<Metrica, "id">) => Promise<void>;
  actualizarMetrica: (id: string, cambios: Partial<Metrica>) => Promise<void>;
  eliminarMetrica: (id: string) => Promise<void>;
  crearClase: (clase: Omit<ClassSession, "id">) => Promise<void>;
  eliminarClase: (id: string) => Promise<void>;
  reservar: (classId: string, fecha: string) => Promise<{ ok: boolean; error?: string }>;
  cancelar: (bookingId: string) => Promise<void>;
  marcarAsistencia: (bookingId: string, asistio: boolean) => Promise<void>;
  cambiarEstadoAlumna: (userId: string) => Promise<void>;
  crearPromocion: (promo: Omit<Promocion, "id" | "creadaEn">) => Promise<void>;
  actualizarPromocion: (id: string, cambios: Partial<Promocion>) => Promise<void>;
  eliminarPromocion: (id: string) => Promise<void>;
  crearCoach: (coach: Omit<Coach, "id" | "creadaEn">) => Promise<void>;
  actualizarCoach: (id: string, cambios: Partial<Coach>) => Promise<void>;
  eliminarCoach: (id: string) => Promise<{ ok: boolean; error?: string }>;
  nombreCoach: (coachId: string) => string;
  promocionesVigentes: () => Promocion[];
  promocionesDeInicio: () => Promocion[];
  notificaciones: () => NotificacionPromo[];
  sinLeer: number;
  marcarPromocionesLeidas: () => Promise<void>;
  sesionesDeLaSemana: (offsetSemanas: number) => SesionDelDia[][];
  sesion: (classId: string, fecha: string) => SesionDelDia | null;
  reservasDeUsuario: (userId: string) => Array<{ booking: Booking; clase: ClassSession }>;
  reservasDeSesion: (classId: string, fecha: string) => Array<{ booking: Booking; alumna: User }>;
  ultimaAsistencia: (userId: string) => string | null;
}

const StoreContext = createContext<StoreValue | null>(null);

function leerEstado(): AppState {
  if (typeof window === "undefined") return crearEstadoInicial();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.classes)) {
        // Campos añadidos después de la primera versión guardada.
        return {
          ...parsed,
          promociones: parsed.promociones ?? [],
          coaches: parsed.coaches ?? COACHES,
          estudio: parsed.estudio ?? ESTUDIO,
          pilares: parsed.pilares ?? PILARES_INICIALES,
          metricas: parsed.metricas ?? METRICAS_INICIALES,
          leidas: parsed.leidas ?? {},
        };
      }
    }
  } catch {
    /* estado corrupto: se regenera la semilla */
  }
  return crearEstadoInicial();
}

function id(prefijo: string): string {
  return `${prefijo}-${Math.random().toString(36).slice(2, 9)}`;
}

const ESTUDIO_VACIO: Estudio = {
  nombre: "",
  lema: "",
  direccion: "",
  ciudad: "",
  telefono: "",
  email: "",
  instagram: "",
  mapa: "",
};

const ESTADO_VACIO: AppState = {
  users: [],
  config: [],
  classes: [],
  bookings: [],
  promociones: [],
  coaches: [],
  estudio: ESTUDIO_VACIO,
  pilares: [],
  metricas: [],
  leidas: {},
  sessionUserId: null,
};

/**
 * Trae el estado completo desde Supabase. Las políticas de seguridad por
 * filas ya deciden qué ve cada quien (sin sesión: horarios, clases y
 * promociones vigentes; una alumna: lo suyo; el staff: todo), así que basta
 * con pedir cada tabla entera y confiar en lo que Postgres deje pasar.
 */
async function cargarEstadoRemoto(): Promise<AppState> {
  const sb = clienteNavegador();
  const { data: sesion } = await sb.auth.getUser();
  const sessionUserId = sesion.user?.id ?? null;

  const [
    config,
    classes,
    promociones,
    coaches,
    estudio,
    pilares,
    metricas,
    perfiles,
    reservas,
    leidasFila,
  ] = await Promise.all([
    datosConfig.leerConfiguracion(),
    datosClases.listarClases(),
    datosPromos.listarPromociones(),
    datosCoaches.listarCoaches(),
    datosEstudio.leerEstudio(),
    datosPilares.listarPilares(),
    datosMetricas.listarMetricas(),
    sb.from("perfiles").select("*"),
    sb.from("reservas").select("*"),
    sb.from("promociones_leidas").select("*"),
  ]);

  if (perfiles.error) throw new Error(perfiles.error.message);
  if (reservas.error) throw new Error(reservas.error.message);
  if (leidasFila.error) throw new Error(leidasFila.error.message);

  const leidas: Record<string, string[]> = {};
  if (sessionUserId) {
    leidas[sessionUserId] = (leidasFila.data ?? []).map((f) => f.promocion_id);
  }

  return {
    users: (perfiles.data ?? []).map(aUsuario),
    config,
    classes,
    bookings: (reservas.data ?? []).map(aReserva),
    promociones,
    coaches,
    estudio,
    pilares,
    metricas,
    leidas,
    sessionUserId,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const remoto = hayBaseDeDatos();
  const [state, setState] = useState<AppState>(() => (remoto ? ESTADO_VACIO : crearEstadoInicial()));
  const [hidratado, setHidratado] = useState(false);
  const montado = useRef(true);

  const recargar = useCallback(async () => {
    try {
      const nuevo = await cargarEstadoRemoto();
      if (montado.current) setState(nuevo);
    } catch (e) {
      console.error("No fue posible cargar los datos de Supabase:", e);
    }
  }, []);

  // Carga inicial y, en modo remoto, la sesión de Supabase.
  useEffect(() => {
    montado.current = true;

    if (!remoto) {
      setState(leerEstado());
      setHidratado(true);
      return;
    }

    recargar().finally(() => {
      if (montado.current) setHidratado(true);
    });

    const sb = clienteNavegador();
    const { data: suscripcion } = sb.auth.onAuthStateChange((evento) => {
      if (evento === "SIGNED_IN" || evento === "SIGNED_OUT") recargar();
    });

    return () => {
      montado.current = false;
      suscripcion.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoto]);

  // Persistencia local: solo aplica al modo sin base de datos.
  useEffect(() => {
    if (!hidratado || remoto) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hidratado, remoto]);

  const usuario = useMemo(
    () => state.users.find((u) => u.id === state.sessionUserId) ?? null,
    [state.users, state.sessionUserId],
  );

  const alumnas = useMemo(() => state.users.filter((u) => u.role === "alumna"), [state.users]);

  const login: StoreValue["login"] = useCallback(
    async (email, password) => {
      if (remoto) {
        const r = await datosAuth.entrar(email, password);
        if (!r.ok) return r;
        const perfil = await datosAuth.perfilActual();
        await recargar();
        return { ok: true, role: perfil?.role };
      }

      const encontrada = state.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (!encontrada) return { ok: false, error: "No existe una cuenta con ese correo." };
      if (encontrada.password !== password) return { ok: false, error: "La contraseña no coincide." };
      setState((s) => ({ ...s, sessionUserId: encontrada.id }));
      return { ok: true, role: encontrada.role };
    },
    [remoto, recargar, state.users],
  );

  const registrar: StoreValue["registrar"] = useCallback(
    async ({ nombre, email, telefono, password }) => {
      if (remoto) {
        const r = await datosAuth.registrar({ nombre, email, telefono, password });
        if (!r.ok) return r;
        const perfil = await datosAuth.perfilActual();
        if (perfil) await recargar();
        return { ok: true, sesionActiva: Boolean(perfil) };
      }

      const limpio = email.trim().toLowerCase();
      if (state.users.some((u) => u.email.toLowerCase() === limpio)) {
        return { ok: false, error: "Ya existe una cuenta con ese correo." };
      }
      const nueva: User = {
        id: id("usr"),
        nombre: nombre.trim(),
        email: limpio,
        telefono: telefono.trim(),
        password,
        role: "alumna",
        activa: true,
        creadaEn: new Date().toISOString(),
      };
      setState((s) => ({ ...s, users: [...s.users, nueva], sessionUserId: nueva.id }));
      return { ok: true, sesionActiva: true };
    },
    [remoto, recargar, state.users],
  );

  const salir = useCallback(async () => {
    if (remoto) {
      await datosAuth.salir();
      await recargar();
      return;
    }
    setState((s) => ({ ...s, sessionUserId: null }));
  }, [remoto, recargar]);

  const solicitarRecuperacion = useCallback(
    async (email: string) => {
      if (!remoto) return { ok: false, error: "Esta función requiere una base de datos conectada." };
      return datosAuth.solicitarRecuperacion(email);
    },
    [remoto],
  );

  const restablecerPassword = useCallback(
    async (password: string) => {
      if (!remoto) return { ok: false, error: "Esta función requiere una base de datos conectada." };
      return datosAuth.restablecerPassword(password);
    },
    [remoto],
  );

  const guardarConfig = useCallback(
    async (config: DayConfig[]) => {
      if (remoto) {
        await datosConfig.guardarConfiguracion(config);
        await recargar();
        return;
      }
      setState((s) => ({ ...s, config }));
    },
    [remoto, recargar],
  );

  const guardarEstudio = useCallback(
    async (cambios: Partial<Estudio>) => {
      if (remoto) {
        await datosEstudio.guardarEstudio(cambios);
        await recargar();
        return;
      }
      setState((s) => ({ ...s, estudio: { ...s.estudio, ...cambios } }));
    },
    [remoto, recargar],
  );

  const crearPilar = useCallback(
    async (pilar: Omit<Pilar, "id">) => {
      if (remoto) {
        await datosPilares.crearPilar(pilar);
        await recargar();
        return;
      }
      setState((s) => ({ ...s, pilares: [...s.pilares, { ...pilar, id: id("plr") }] }));
    },
    [remoto, recargar],
  );

  const actualizarPilar = useCallback(
    async (pilarId: string, cambios: Partial<Pilar>) => {
      if (remoto) {
        await datosPilares.actualizarPilar(pilarId, cambios);
        await recargar();
        return;
      }
      setState((s) => ({
        ...s,
        pilares: s.pilares.map((p) => (p.id === pilarId ? { ...p, ...cambios } : p)),
      }));
    },
    [remoto, recargar],
  );

  const eliminarPilar = useCallback(
    async (pilarId: string) => {
      if (remoto) {
        await datosPilares.eliminarPilar(pilarId);
        await recargar();
        return;
      }
      setState((s) => ({ ...s, pilares: s.pilares.filter((p) => p.id !== pilarId) }));
    },
    [remoto, recargar],
  );

  const crearMetrica = useCallback(
    async (metrica: Omit<Metrica, "id">) => {
      if (remoto) {
        await datosMetricas.crearMetrica(metrica);
        await recargar();
        return;
      }
      setState((s) => ({ ...s, metricas: [...s.metricas, { ...metrica, id: id("mtr") }] }));
    },
    [remoto, recargar],
  );

  const actualizarMetrica = useCallback(
    async (metricaId: string, cambios: Partial<Metrica>) => {
      if (remoto) {
        await datosMetricas.actualizarMetrica(metricaId, cambios);
        await recargar();
        return;
      }
      setState((s) => ({
        ...s,
        metricas: s.metricas.map((m) => (m.id === metricaId ? { ...m, ...cambios } : m)),
      }));
    },
    [remoto, recargar],
  );

  const eliminarMetrica = useCallback(
    async (metricaId: string) => {
      if (remoto) {
        await datosMetricas.eliminarMetrica(metricaId);
        await recargar();
        return;
      }
      setState((s) => ({ ...s, metricas: s.metricas.filter((m) => m.id !== metricaId) }));
    },
    [remoto, recargar],
  );

  const crearClase = useCallback(
    async (clase: Omit<ClassSession, "id">) => {
      if (remoto) {
        await datosClases.crearClase(clase);
        await recargar();
        return;
      }
      setState((s) => ({ ...s, classes: [...s.classes, { ...clase, id: id("cls") }] }));
    },
    [remoto, recargar],
  );

  const eliminarClase = useCallback(
    async (claseId: string) => {
      if (remoto) {
        await datosClases.eliminarClase(claseId);
        await recargar();
        return;
      }
      setState((s) => ({
        ...s,
        classes: s.classes.filter((c) => c.id !== claseId),
        bookings: s.bookings.filter((b) => b.classId !== claseId),
      }));
    },
    [remoto, recargar],
  );

  const cuposUsados = useCallback(
    (classId: string, fecha: string) =>
      state.bookings.filter((b) => b.classId === classId && b.fecha === fecha).length,
    [state.bookings],
  );

  const reservar: StoreValue["reservar"] = useCallback(
    async (classId, fecha) => {
      if (remoto) {
        const r = await datosReservas.reservar(classId, fecha);
        if (r.ok) await recargar();
        return r;
      }

      if (!state.sessionUserId) return { ok: false, error: "Inicia sesión para agendar." };
      const clase = state.classes.find((c) => c.id === classId);
      if (!clase) return { ok: false, error: "La clase ya no está disponible." };
      const yaReservada = state.bookings.some(
        (b) => b.classId === classId && b.fecha === fecha && b.userId === state.sessionUserId,
      );
      if (yaReservada) return { ok: false, error: "Ya tienes un cupo en esta clase." };
      if (cuposUsados(classId, fecha) >= clase.cupo) {
        return { ok: false, error: "No quedan cupos disponibles." };
      }
      const booking: Booking = {
        id: id("bkg"),
        classId,
        userId: state.sessionUserId,
        fecha,
        asistio: false,
        creadaEn: new Date().toISOString(),
      };
      setState((s) => ({ ...s, bookings: [...s.bookings, booking] }));
      return { ok: true };
    },
    [remoto, recargar, state.sessionUserId, state.classes, state.bookings, cuposUsados],
  );

  const cancelar = useCallback(
    async (bookingId: string) => {
      if (remoto) {
        await datosReservas.cancelar(bookingId);
        await recargar();
        return;
      }
      setState((s) => ({ ...s, bookings: s.bookings.filter((b) => b.id !== bookingId) }));
    },
    [remoto, recargar],
  );

  const marcarAsistencia = useCallback(
    async (bookingId: string, asistio: boolean) => {
      if (remoto) {
        await datosReservas.marcarAsistencia(bookingId, asistio);
        await recargar();
        return;
      }
      setState((s) => ({
        ...s,
        bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, asistio } : b)),
      }));
    },
    [remoto, recargar],
  );

  const cambiarEstadoAlumna = useCallback(
    async (userId: string) => {
      if (remoto) {
        const actual = state.users.find((u) => u.id === userId);
        if (!actual) return;
        await cambiarEstadoAlumnaRemoto(userId, !actual.activa);
        await recargar();
        return;
      }
      setState((s) => ({
        ...s,
        users: s.users.map((u) => (u.id === userId ? { ...u, activa: !u.activa } : u)),
      }));
    },
    [remoto, recargar, state.users],
  );

  const crearPromocion = useCallback(
    async (promo: Omit<Promocion, "id" | "creadaEn">) => {
      if (remoto) {
        await datosPromos.crearPromocion(promo);
        await recargar();
        return;
      }
      setState((s) => ({
        ...s,
        promociones: [
          { ...promo, id: id("prm"), creadaEn: new Date().toISOString() },
          ...s.promociones,
        ],
      }));
    },
    [remoto, recargar],
  );

  const actualizarPromocion = useCallback(
    async (promoId: string, cambios: Partial<Promocion>) => {
      if (remoto) {
        await datosPromos.actualizarPromocion(promoId, cambios);
        await recargar();
        return;
      }
      setState((s) => ({
        ...s,
        promociones: s.promociones.map((p) => (p.id === promoId ? { ...p, ...cambios } : p)),
      }));
    },
    [remoto, recargar],
  );

  const eliminarPromocion = useCallback(
    async (promoId: string) => {
      if (remoto) {
        await datosPromos.eliminarPromocion(promoId);
        await recargar();
        return;
      }
      setState((s) => ({
        ...s,
        promociones: s.promociones.filter((p) => p.id !== promoId),
        leidas: Object.fromEntries(
          Object.entries(s.leidas).map(([uid, ids]) => [uid, ids.filter((x) => x !== promoId)]),
        ),
      }));
    },
    [remoto, recargar],
  );

  const crearCoach = useCallback(
    async (coach: Omit<Coach, "id" | "creadaEn">) => {
      if (remoto) {
        await datosCoaches.crearCoach(coach);
        await recargar();
        return;
      }
      setState((s) => ({
        ...s,
        coaches: [...s.coaches, { ...coach, id: id("cch"), creadaEn: new Date().toISOString() }],
      }));
    },
    [remoto, recargar],
  );

  const actualizarCoach = useCallback(
    async (coachId: string, cambios: Partial<Coach>) => {
      if (remoto) {
        await datosCoaches.actualizarCoach(coachId, cambios);
        await recargar();
        return;
      }
      setState((s) => ({
        ...s,
        coaches: s.coaches.map((c) => (c.id === coachId ? { ...c, ...cambios } : c)),
      }));
    },
    [remoto, recargar],
  );

  const eliminarCoach = useCallback(
    async (coachId: string) => {
      if (remoto) {
        const r = await datosCoaches.eliminarCoach(coachId);
        if (r.ok) await recargar();
        return r;
      }
      if (state.classes.some((cl) => cl.coachId === coachId)) {
        return {
          ok: false,
          error: "No puedes eliminar esta coach: todavía tiene clases asignadas. Reasígnalas o elimínalas primero.",
        };
      }
      setState((s) => ({ ...s, coaches: s.coaches.filter((c) => c.id !== coachId) }));
      return { ok: true };
    },
    [remoto, recargar, state.classes],
  );

  const nombreCoach = useCallback(
    (coachId: string) => state.coaches.find((c) => c.id === coachId)?.nombre ?? "Coach",
    [state.coaches],
  );

  /** Activa y dentro de su ventana de fechas. */
  const promocionesVigentes = useCallback(() => {
    const hoy = hoyISO();
    return state.promociones
      .filter((p) => p.activa && p.desde <= hoy && p.hasta >= hoy)
      .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn));
  }, [state.promociones]);

  const promocionesDeInicio = useCallback(
    () => promocionesVigentes().filter((p) => p.enInicio),
    [promocionesVigentes],
  );

  const notificaciones = useCallback((): NotificacionPromo[] => {
    const vistas = state.sessionUserId ? (state.leidas[state.sessionUserId] ?? []) : [];
    return promocionesVigentes()
      .filter((p) => p.notificar)
      .map((promocion) => ({ promocion, leida: vistas.includes(promocion.id) }));
  }, [promocionesVigentes, state.leidas, state.sessionUserId]);

  const sinLeer = useMemo(
    () => notificaciones().filter((n) => !n.leida).length,
    [notificaciones],
  );

  const marcarPromocionesLeidas = useCallback(async () => {
    if (!state.sessionUserId) return;
    const hoy = hoyISO();
    const ids = state.promociones
      .filter((p) => p.activa && p.notificar && p.desde <= hoy && p.hasta >= hoy)
      .map((p) => p.id);

    if (remoto) {
      const pendientes = ids.filter((pid) => !(state.leidas[state.sessionUserId!] ?? []).includes(pid));
      if (pendientes.length === 0) return;
      await datosPromos.marcarLeidas(state.sessionUserId, pendientes);
      await recargar();
      return;
    }

    setState((s) => {
      if (!s.sessionUserId) return s;
      return { ...s, leidas: { ...s.leidas, [s.sessionUserId]: ids } };
    });
  }, [remoto, recargar, state.sessionUserId, state.promociones, state.leidas]);

  const construirSesion = useCallback(
    (clase: ClassSession, fecha: string): SesionDelDia => {
      const reservadas = cuposUsados(clase.id, fecha);
      const reservaPropia =
        state.bookings.find(
          (b) => b.classId === clase.id && b.fecha === fecha && b.userId === state.sessionUserId,
        ) ?? null;
      return {
        clase,
        fecha,
        reservadas,
        disponibles: Math.max(clase.cupo - reservadas, 0),
        reservaPropia,
        pasada: fecha < hoyISO(),
      };
    },
    [cuposUsados, state.bookings, state.sessionUserId],
  );

  const sesionesDeLaSemana = useCallback(
    (offsetSemanas: number) => {
      const lunes = addDays(startOfWeek(new Date()), offsetSemanas * 7);
      return Array.from({ length: 7 }, (_, d) => {
        const fecha = toISODate(addDays(lunes, d));
        return state.classes
          .filter((c) => c.day === d && (c.semanal || c.fecha === fecha))
          .sort((a, b) => a.hora.localeCompare(b.hora))
          .map((c) => construirSesion(c, fecha));
      });
    },
    [state.classes, construirSesion],
  );

  const sesion = useCallback(
    (classId: string, fecha: string) => {
      const clase = state.classes.find((c) => c.id === classId);
      if (!clase) return null;
      return construirSesion(clase, fecha);
    },
    [state.classes, construirSesion],
  );

  const reservasDeUsuario = useCallback(
    (userId: string) =>
      state.bookings
        .filter((b) => b.userId === userId)
        .map((booking) => ({
          booking,
          clase: state.classes.find((c) => c.id === booking.classId),
        }))
        .filter((r): r is { booking: Booking; clase: ClassSession } => Boolean(r.clase))
        .sort((a, b) =>
          a.booking.fecha === b.booking.fecha
            ? a.clase.hora.localeCompare(b.clase.hora)
            : a.booking.fecha.localeCompare(b.booking.fecha),
        ),
    [state.bookings, state.classes],
  );

  const reservasDeSesion = useCallback(
    (classId: string, fecha: string) =>
      state.bookings
        .filter((b) => b.classId === classId && b.fecha === fecha)
        .map((booking) => ({
          booking,
          alumna: state.users.find((u) => u.id === booking.userId),
        }))
        .filter((r): r is { booking: Booking; alumna: User } => Boolean(r.alumna))
        .sort((a, b) => a.alumna.nombre.localeCompare(b.alumna.nombre)),
    [state.bookings, state.users],
  );

  const ultimaAsistencia = useCallback(
    (userId: string) => {
      const fechas = state.bookings
        .filter((b) => b.userId === userId && b.asistio)
        .map((b) => b.fecha)
        .sort();
      return fechas.length ? fechas[fechas.length - 1] : null;
    },
    [state.bookings],
  );

  const value: StoreValue = {
    hidratado,
    state,
    usuario,
    alumnas,
    login,
    registrar,
    salir,
    solicitarRecuperacion,
    restablecerPassword,
    guardarConfig,
    guardarEstudio,
    crearPilar,
    actualizarPilar,
    eliminarPilar,
    crearMetrica,
    actualizarMetrica,
    eliminarMetrica,
    crearClase,
    eliminarClase,
    reservar,
    cancelar,
    marcarAsistencia,
    cambiarEstadoAlumna,
    crearPromocion,
    actualizarPromocion,
    eliminarPromocion,
    crearCoach,
    actualizarCoach,
    eliminarCoach,
    nombreCoach,
    promocionesVigentes,
    promocionesDeInicio,
    notificaciones,
    sinLeer,
    marcarPromocionesLeidas,
    sesionesDeLaSemana,
    sesion,
    reservasDeUsuario,
    reservasDeSesion,
    ultimaAsistencia,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return ctx;
}

export { dayIndex, fromISODate };

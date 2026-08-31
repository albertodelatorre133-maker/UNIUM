"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { crearEstadoInicial } from "./seed";
import type { AppState, Booking, ClassSession, DayConfig, User } from "./types";
import { addDays, dayIndex, fromISODate, hoyISO, startOfWeek, toISODate } from "./date";

const STORAGE_KEY = "unium.state.v1";

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
  login: (email: string, password: string) => { ok: boolean; error?: string; role?: User["role"] };
  registrar: (datos: {
    nombre: string;
    email: string;
    telefono: string;
    password: string;
  }) => { ok: boolean; error?: string };
  salir: () => void;
  guardarConfig: (config: DayConfig[]) => void;
  crearClase: (clase: Omit<ClassSession, "id">) => void;
  eliminarClase: (id: string) => void;
  reservar: (classId: string, fecha: string) => { ok: boolean; error?: string };
  cancelar: (bookingId: string) => void;
  marcarAsistencia: (bookingId: string, asistio: boolean) => void;
  cambiarEstadoAlumna: (userId: string) => void;
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
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.classes)) return parsed;
    }
  } catch {
    /* estado corrupto: se regenera la semilla */
  }
  return crearEstadoInicial();
}

function id(prefijo: string): string {
  return `${prefijo}-${Math.random().toString(36).slice(2, 9)}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => crearEstadoInicial());
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    setState(leerEstado());
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hidratado]);

  const usuario = useMemo(
    () => state.users.find((u) => u.id === state.sessionUserId) ?? null,
    [state.users, state.sessionUserId],
  );

  const alumnas = useMemo(() => state.users.filter((u) => u.role === "alumna"), [state.users]);

  const login: StoreValue["login"] = useCallback(
    (email, password) => {
      const encontrada = state.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (!encontrada) return { ok: false, error: "No existe una cuenta con ese correo." };
      if (encontrada.password !== password) return { ok: false, error: "La contraseña no coincide." };
      setState((s) => ({ ...s, sessionUserId: encontrada.id }));
      return { ok: true, role: encontrada.role };
    },
    [state.users],
  );

  const registrar: StoreValue["registrar"] = useCallback(
    ({ nombre, email, telefono, password }) => {
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
      return { ok: true };
    },
    [state.users],
  );

  const salir = useCallback(() => setState((s) => ({ ...s, sessionUserId: null })), []);

  const guardarConfig = useCallback(
    (config: DayConfig[]) => setState((s) => ({ ...s, config })),
    [],
  );

  const crearClase = useCallback((clase: Omit<ClassSession, "id">) => {
    setState((s) => ({ ...s, classes: [...s.classes, { ...clase, id: id("cls") }] }));
  }, []);

  const eliminarClase = useCallback((claseId: string) => {
    setState((s) => ({
      ...s,
      classes: s.classes.filter((c) => c.id !== claseId),
      bookings: s.bookings.filter((b) => b.classId !== claseId),
    }));
  }, []);

  const cuposUsados = useCallback(
    (classId: string, fecha: string) =>
      state.bookings.filter((b) => b.classId === classId && b.fecha === fecha).length,
    [state.bookings],
  );

  const reservar: StoreValue["reservar"] = useCallback(
    (classId, fecha) => {
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
    [state.sessionUserId, state.classes, state.bookings, cuposUsados],
  );

  const cancelar = useCallback((bookingId: string) => {
    setState((s) => ({ ...s, bookings: s.bookings.filter((b) => b.id !== bookingId) }));
  }, []);

  const marcarAsistencia = useCallback((bookingId: string, asistio: boolean) => {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, asistio } : b)),
    }));
  }, []);

  const cambiarEstadoAlumna = useCallback((userId: string) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === userId ? { ...u, activa: !u.activa } : u)),
    }));
  }, []);

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
    guardarConfig,
    crearClase,
    eliminarClase,
    reservar,
    cancelar,
    marcarAsistencia,
    cambiarEstadoAlumna,
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

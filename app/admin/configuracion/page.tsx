"use client";

import { useEffect, useState } from "react";
import { Icono, ICONOS_PILARES } from "@/components/Icono";
import { NotificacionesPush } from "@/components/NotificacionesPush";
import { useStore } from "@/lib/store";
import { DIAS } from "@/lib/date";
import { hayBaseDeDatos } from "@/lib/supabase/cliente";
import type { DayConfig, Estudio, Metrica, Pilar } from "@/lib/types";

const HORAS = Array.from({ length: 24 * 2 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const PESTANAS = [
  { id: "horario", label: "Horario", icono: "schedule" },
  { id: "estudio", label: "Estudio", icono: "location_on" },
  { id: "metodo", label: "Método", icono: "fitness_center" },
  { id: "metricas", label: "Cifras", icono: "trending_up" },
  { id: "notificaciones", label: "Notificaciones", icono: "notifications" },
] as const;

type Pestana = (typeof PESTANAS)[number]["id"];

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<Pestana>("horario");

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow hidden sm:block">Ajustes del estudio</span>
        <h1 className="font-display text-[28px] font-bold uppercase tracking-tight sm:mt-2 sm:text-4xl lg:text-5xl">
          Configuración
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] text-muted sm:text-sm">
          Todo lo que ven las alumnas fuera del calendario: horarios, datos de contacto y el método
          que se muestra en la página de inicio.
        </p>
      </header>

      <nav className="flex gap-2 overflow-x-auto">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setTab(p.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] transition ${
              tab === p.id
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/10 text-muted hover:border-white/25 hover:text-white"
            }`}
          >
            <Icono nombre={p.icono} size={14} />
            {p.label}
          </button>
        ))}
      </nav>

      {tab === "horario" && <PestanaHorario />}
      {tab === "estudio" && <PestanaEstudio />}
      {tab === "metodo" && <PestanaMetodo />}
      {tab === "metricas" && <PestanaMetricas />}
      {tab === "notificaciones" && <PestanaNotificaciones />}
    </div>
  );
}

function PestanaNotificaciones() {
  if (!hayBaseDeDatos()) {
    return (
      <div className="glass px-6 py-16 text-center">
        <Icono nombre="notifications" size={34} className="mx-auto text-muted-dim" />
        <p className="mt-4 text-sm text-muted">
          Las notificaciones push necesitan la base de datos conectada.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-[13px] text-muted sm:text-sm">
        Actívalas en cada celular/computador del staff desde donde quieras enterarte al momento en
        que una alumna agenda una clase.
      </p>
      <NotificacionesPush descripcion="Te avisa cada vez que una alumna agenda una clase" />
    </div>
  );
}

function PestanaHorario() {
  const { state, guardarConfig } = useStore();
  const [config, setConfig] = useState<DayConfig[]>(state.config);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => setConfig(state.config), [state.config]);

  function actualizar(day: number, cambios: Partial<DayConfig>) {
    setConfig((c) => c.map((d) => (d.day === day ? { ...d, ...cambios } : d)));
    setGuardado(false);
  }

  const invalidos = config.filter((d) => d.activo && d.apertura >= d.cierre);
  const diasActivos = config.filter((d) => d.activo).length;

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[
          { icono: "event_available", valor: String(diasActivos), etiqueta: "Días activos" },
          { icono: "schedule", valor: String(7 - diasActivos), etiqueta: "Días cerrados" },
          {
            icono: "rule",
            valor: invalidos.length ? String(invalidos.length) : "0",
            etiqueta: "Rangos inválidos",
          },
        ].map((m) => (
          <div key={m.etiqueta} className="glass flex items-center gap-3 p-3.5 sm:gap-4 sm:p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <Icono nombre={m.icono} size={16} />
            </span>
            <div>
              <p className="font-display text-xl font-bold text-white sm:text-2xl">{m.valor}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-dim">
                {m.etiqueta}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="glass p-5 sm:p-7">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
          Horario operativo
        </h2>
        <div className="my-5 hairline" />

        <div className="space-y-3">
          {config.map((d) => {
            const invalido = d.activo && d.apertura >= d.cierre;
            return (
              <div
                key={d.day}
                className={`flex flex-col gap-4 rounded-xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                  d.activo
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-dashed border-white/10 bg-transparent"
                } ${invalido ? "!border-red-500/40" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={d.activo}
                    aria-label={`Activar ${DIAS[d.day]}`}
                    onClick={() => actualizar(d.day, { activo: !d.activo })}
                    className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
                      d.activo
                        ? "border-primary/50 bg-primary/25"
                        : "border-white/15 bg-white/[0.05]"
                    }`}
                  >
                    <span
                      className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-all ${
                        d.activo ? "left-[26px] bg-gold-gradient" : "left-1 bg-muted-dim"
                      }`}
                    />
                  </button>
                  <div>
                    <p
                      className={`font-display text-lg font-semibold uppercase tracking-[0.14em] ${
                        d.activo ? "text-white" : "text-muted-dim"
                      }`}
                    >
                      {DIAS[d.day]}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-dim">
                      {d.activo ? "Abierto" : "Cerrado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <label htmlFor={`apertura-${d.day}`} className="!mb-1">
                      Apertura
                    </label>
                    <select
                      id={`apertura-${d.day}`}
                      disabled={!d.activo}
                      className="!py-2 text-xs disabled:opacity-40"
                      value={d.apertura}
                      onChange={(e) => actualizar(d.day, { apertura: e.target.value })}
                    >
                      {HORAS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="mt-6 text-muted-dim">—</span>
                  <div>
                    <label htmlFor={`cierre-${d.day}`} className="!mb-1">
                      Cierre
                    </label>
                    <select
                      id={`cierre-${d.day}`}
                      disabled={!d.activo}
                      className="!py-2 text-xs disabled:opacity-40"
                      value={d.cierre}
                      onChange={(e) => actualizar(d.day, { cierre: e.target.value })}
                    >
                      {HORAS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {invalidos.length > 0 && (
          <p className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            <Icono nombre="error" size={16} />
            La hora de cierre debe ser posterior a la de apertura en{" "}
            {invalidos.map((d) => DIAS[d.day]).join(", ")}.
          </p>
        )}

        <div className="mt-7 flex flex-col items-center gap-4 sm:flex-row">
          <button
            type="button"
            disabled={invalidos.length > 0}
            onClick={async () => {
              await guardarConfig(config);
              setGuardado(true);
            }}
            className="btn-gold w-full sm:w-auto"
          >
            <Icono nombre="save" />
            GUARDAR HORARIO
          </button>
          <button
            type="button"
            className="btn-ghost w-full sm:w-auto"
            onClick={() => {
              setConfig(state.config);
              setGuardado(false);
            }}
          >
            Descartar cambios
          </button>
          {guardado && (
            <span className="chip-gold">
              <Icono nombre="check_circle" size={14} />
              Horario guardado
            </span>
          )}
        </div>
      </section>
    </div>
  );
}

function PestanaEstudio() {
  const { state, guardarEstudio } = useStore();
  const [borrador, setBorrador] = useState<Estudio>(state.estudio);
  const [enviando, setEnviando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => setBorrador(state.estudio), [state.estudio]);

  const CAMPOS: Array<{ campo: keyof Estudio; label: string; placeholder: string }> = [
    { campo: "nombre", label: "Nombre del estudio", placeholder: "UNIUM Wellness Training" },
    { campo: "lema", label: "Lema", placeholder: "Unidos somos más fuertes" },
    { campo: "direccion", label: "Dirección", placeholder: "Calle 93B #13-45, Chicó Norte" },
    { campo: "ciudad", label: "Ciudad", placeholder: "Bogotá, Colombia" },
    { campo: "telefono", label: "Teléfono", placeholder: "+57 320 448 9012" },
    { campo: "email", label: "Correo de contacto", placeholder: "hola@unium.fit" },
    { campo: "instagram", label: "Instagram", placeholder: "@unium.wellness" },
  ];

  return (
    <section className="glass p-5 sm:p-7">
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
        Datos del estudio
      </h2>
      <p className="mt-2 max-w-xl text-[13px] text-muted">
        Se muestran en la página de inicio, en el pie de las pantallas de acceso y en el detalle de
        cada clase.
      </p>
      <div className="my-5 hairline" />

      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setEnviando(true);
          await guardarEstudio(borrador);
          setEnviando(false);
          setGuardado(true);
        }}
      >
        {CAMPOS.map(({ campo, label, placeholder }) => (
          <div key={campo}>
            <label htmlFor={`e-${campo}`}>{label}</label>
            <input
              id={`e-${campo}`}
              placeholder={placeholder}
              className="w-full"
              value={borrador[campo]}
              onChange={(e) => {
                setBorrador({ ...borrador, [campo]: e.target.value });
                setGuardado(false);
              }}
            />
          </div>
        ))}

        <div className="sm:col-span-2">
          <label htmlFor="e-mapa">URL del mapa (embed de OpenStreetMap o Google Maps)</label>
          <input
            id="e-mapa"
            placeholder="https://www.openstreetmap.org/export/embed.html?..."
            className="w-full"
            value={borrador.mapa}
            onChange={(e) => {
              setBorrador({ ...borrador, mapa: e.target.value });
              setGuardado(false);
            }}
          />
        </div>

        <div className="flex flex-col items-center gap-4 sm:col-span-2 sm:flex-row">
          <button type="submit" disabled={enviando} className="btn-gold w-full sm:w-auto">
            <Icono nombre="save" size={16} />
            {enviando ? "GUARDANDO…" : "GUARDAR DATOS"}
          </button>
          {guardado && !enviando && (
            <span className="chip-gold">
              <Icono nombre="check_circle" size={14} />
              Datos guardados
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

type BorradorPilar = Omit<Pilar, "id" | "orden">;

function borradorPilarNuevo(): BorradorPilar {
  return { icono: "fitness_center", titulo: "", texto: "" };
}

function PestanaMetodo() {
  const { state, crearPilar, actualizarPilar, eliminarPilar } = useStore();
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [borrador, setBorrador] = useState<BorradorPilar>(borradorPilarNuevo());
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const pilares = [...state.pilares].sort((a, b) => a.orden - b.orden);

  function nuevo() {
    setBorrador(borradorPilarNuevo());
    setEditando(null);
    setError(null);
    setAbierto(true);
  }

  function editar(p: Pilar) {
    setBorrador({ icono: p.icono, titulo: p.titulo, texto: p.texto });
    setEditando(p.id);
    setError(null);
    setAbierto(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!borrador.titulo.trim()) {
      setError("Ponle un título al pilar.");
      return;
    }
    setEnviando(true);
    if (editando) {
      await actualizarPilar(editando, borrador);
    } else {
      await crearPilar({ ...borrador, orden: pilares.length });
    }
    setEnviando(false);
    setAbierto(false);
    setEditando(null);
  }

  async function mover(id: string, direccion: -1 | 1) {
    const i = pilares.findIndex((p) => p.id === id);
    const j = i + direccion;
    if (i < 0 || j < 0 || j >= pilares.length) return;
    await Promise.all([
      actualizarPilar(pilares[i].id, { orden: pilares[j].orden }),
      actualizarPilar(pilares[j].id, { orden: pilares[i].orden }),
    ]);
  }

  return (
    <div className="space-y-5">
      <section className="glass p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
              El método
            </h2>
            <p className="mt-2 max-w-xl text-[13px] text-muted">
              Las tarjetas que aparecen en "Cuatro pilares en cada sesión" de la página de inicio.
              El orden aquí es el orden en que se muestran.
            </p>
          </div>
          <button type="button" className="btn-gold shrink-0" onClick={nuevo}>
            <Icono nombre="add" size={16} />
            NUEVO PILAR
          </button>
        </div>

        {abierto && (
          <>
            <div className="my-5 hairline" />
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={guardar}>
              <div>
                <label htmlFor="p-icono">Icono</label>
                <select
                  id="p-icono"
                  className="w-full"
                  value={borrador.icono}
                  onChange={(e) => setBorrador({ ...borrador, icono: e.target.value })}
                >
                  {ICONOS_PILARES.map((i) => (
                    <option key={i.valor} value={i.valor}>
                      {i.etiqueta}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="p-titulo">Título</label>
                <input
                  id="p-titulo"
                  required
                  placeholder="Fuerza con técnica"
                  className="w-full"
                  value={borrador.titulo}
                  onChange={(e) => setBorrador({ ...borrador, titulo: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="p-texto">Texto</label>
                <textarea
                  id="p-texto"
                  rows={2}
                  placeholder="Un par de líneas sobre este pilar del método."
                  className="w-full"
                  value={borrador.texto}
                  onChange={(e) => setBorrador({ ...borrador, texto: e.target.value })}
                />
              </div>

              {error && (
                <p className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300 sm:col-span-2">
                  <Icono nombre="error" size={15} />
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-2.5 sm:flex-row sm:col-span-2">
                <button type="submit" disabled={enviando} className="btn-gold">
                  <Icono nombre="save" size={16} />
                  {enviando ? "GUARDANDO…" : editando ? "GUARDAR CAMBIOS" : "CREAR PILAR"}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setAbierto(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </>
        )}
      </section>

      {pilares.length === 0 ? (
        <div className="glass px-6 py-16 text-center">
          <Icono nombre="fitness_center" size={34} className="mx-auto text-muted-dim" />
          <p className="mt-4 text-sm text-muted">Todavía no has definido ningún pilar.</p>
          <button type="button" className="btn-gold mt-6" onClick={nuevo}>
            <Icono nombre="add" size={16} />
            CREAR EL PRIMERO
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {pilares.map((p, i) => (
            <li key={p.id} className="glass flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                  <Icono nombre={p.icono} size={18} />
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Mover arriba"
                    disabled={i === 0}
                    onClick={() => mover(p.id, -1)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-muted transition hover:border-primary/40 hover:text-primary disabled:opacity-30"
                  >
                    <Icono nombre="chevron_left" size={15} className="rotate-90" />
                  </button>
                  <button
                    type="button"
                    aria-label="Mover abajo"
                    disabled={i === pilares.length - 1}
                    onClick={() => mover(p.id, 1)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-muted transition hover:border-primary/40 hover:text-primary disabled:opacity-30"
                  >
                    <Icono nombre="chevron_right" size={15} className="rotate-90" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Editar ${p.titulo}`}
                    onClick={() => editar(p)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-muted transition hover:border-primary/40 hover:text-primary"
                  >
                    <Icono nombre="edit" size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Eliminar ${p.titulo}`}
                    onClick={() => eliminarPilar(p.id)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-muted transition hover:border-red-500/40 hover:text-red-300"
                  >
                    <Icono nombre="delete" size={15} />
                  </button>
                </div>
              </div>
              <h3 className="mt-4 font-display text-base font-semibold uppercase tracking-wide text-white">
                {p.titulo}
              </h3>
              {p.texto && <p className="mt-2 text-[13px] leading-relaxed text-muted">{p.texto}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type BorradorMetrica = Omit<Metrica, "id" | "orden">;

function borradorMetricaNueva(): BorradorMetrica {
  return { valor: "", etiqueta: "" };
}

function PestanaMetricas() {
  const { state, crearMetrica, actualizarMetrica, eliminarMetrica } = useStore();
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [borrador, setBorrador] = useState<BorradorMetrica>(borradorMetricaNueva());
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const metricas = [...state.metricas].sort((a, b) => a.orden - b.orden);

  function nueva() {
    setBorrador(borradorMetricaNueva());
    setEditando(null);
    setError(null);
    setAbierto(true);
  }

  function editar(m: Metrica) {
    setBorrador({ valor: m.valor, etiqueta: m.etiqueta });
    setEditando(m.id);
    setError(null);
    setAbierto(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!borrador.valor.trim() || !borrador.etiqueta.trim()) {
      setError("Completa el valor y la etiqueta.");
      return;
    }
    setEnviando(true);
    if (editando) {
      await actualizarMetrica(editando, borrador);
    } else {
      await crearMetrica({ ...borrador, orden: metricas.length });
    }
    setEnviando(false);
    setAbierto(false);
    setEditando(null);
  }

  async function mover(id: string, direccion: -1 | 1) {
    const i = metricas.findIndex((m) => m.id === id);
    const j = i + direccion;
    if (i < 0 || j < 0 || j >= metricas.length) return;
    await Promise.all([
      actualizarMetrica(metricas[i].id, { orden: metricas[j].orden }),
      actualizarMetrica(metricas[j].id, { orden: metricas[i].orden }),
    ]);
  }

  return (
    <div className="space-y-5">
      <section className="glass p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
              Cifras del hero
            </h2>
            <p className="mt-2 max-w-xl text-[13px] text-muted">
              Los números destacados justo debajo del titular principal de la página de inicio
              (ej. "12 · Alumnas por clase"). El orden aquí es el orden en que se muestran.
            </p>
          </div>
          <button type="button" className="btn-gold shrink-0" onClick={nueva}>
            <Icono nombre="add" size={16} />
            NUEVA CIFRA
          </button>
        </div>

        {abierto && (
          <>
            <div className="my-5 hairline" />
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={guardar}>
              <div>
                <label htmlFor="m-valor">Valor</label>
                <input
                  id="m-valor"
                  required
                  placeholder="12"
                  className="w-full"
                  value={borrador.valor}
                  onChange={(e) => setBorrador({ ...borrador, valor: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="m-etiqueta">Etiqueta</label>
                <input
                  id="m-etiqueta"
                  required
                  placeholder="Alumnas por clase"
                  className="w-full"
                  value={borrador.etiqueta}
                  onChange={(e) => setBorrador({ ...borrador, etiqueta: e.target.value })}
                />
              </div>

              {error && (
                <p className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300 sm:col-span-2">
                  <Icono nombre="error" size={15} />
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-2.5 sm:flex-row sm:col-span-2">
                <button type="submit" disabled={enviando} className="btn-gold">
                  <Icono nombre="save" size={16} />
                  {enviando ? "GUARDANDO…" : editando ? "GUARDAR CAMBIOS" : "CREAR CIFRA"}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setAbierto(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </>
        )}
      </section>

      {metricas.length === 0 ? (
        <div className="glass px-6 py-16 text-center">
          <Icono nombre="trending_up" size={34} className="mx-auto text-muted-dim" />
          <p className="mt-4 text-sm text-muted">Todavía no has definido ninguna cifra.</p>
          <button type="button" className="btn-gold mt-6" onClick={nueva}>
            <Icono nombre="add" size={16} />
            CREAR LA PRIMERA
          </button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {metricas.map((m, i) => (
            <li
              key={m.id}
              className="glass flex items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="font-display text-2xl font-bold gold-text">{m.valor}</p>
                <p className="truncate font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-dim">
                  {m.etiqueta}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="Mover arriba"
                  disabled={i === 0}
                  onClick={() => mover(m.id, -1)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-muted transition hover:border-primary/40 hover:text-primary disabled:opacity-30"
                >
                  <Icono nombre="chevron_left" size={15} className="rotate-90" />
                </button>
                <button
                  type="button"
                  aria-label="Mover abajo"
                  disabled={i === metricas.length - 1}
                  onClick={() => mover(m.id, 1)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-muted transition hover:border-primary/40 hover:text-primary disabled:opacity-30"
                >
                  <Icono nombre="chevron_right" size={15} className="rotate-90" />
                </button>
                <button
                  type="button"
                  aria-label={`Editar ${m.etiqueta}`}
                  onClick={() => editar(m)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-muted transition hover:border-primary/40 hover:text-primary"
                >
                  <Icono nombre="edit" size={15} />
                </button>
                <button
                  type="button"
                  aria-label={`Eliminar ${m.etiqueta}`}
                  onClick={() => eliminarMetrica(m.id)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-muted transition hover:border-red-500/40 hover:text-red-300"
                >
                  <Icono nombre="delete" size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

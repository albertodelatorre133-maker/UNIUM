import Link from "next/link";
import { NavPublica } from "@/components/NavPublica";
import { Icono } from "@/components/Icono";
import { Foto } from "@/components/Foto";
import { LogoCompleto } from "@/components/Marca";
import { PromocionesInicio } from "@/components/PromocionesInicio";
import { CLASES, COACHES, ESTUDIO, FOTOS } from "@/lib/seed";
import { DIAS, sumarMinutos } from "@/lib/date";

const METRICAS = [
  { valor: "12", etiqueta: "Alumnas por clase" },
  { valor: "6", etiqueta: "Días de operación" },
  { valor: "45'", etiqueta: "Sesión promedio" },
  { valor: "100%", etiqueta: "Entrenamiento guiado" },
];

const METODO = [
  {
    icono: "fitness_center",
    titulo: "Fuerza con técnica",
    texto:
      "Progresiones medidas, cargas conscientes y corrección constante. Cada bloque se construye sobre el anterior.",
  },
  {
    icono: "self_improvement",
    titulo: "Movilidad y core",
    texto:
      "Respiración, control profundo y rangos articulares reales. La base sobre la que se sostiene la fuerza.",
  },
  {
    icono: "monitor_heart",
    titulo: "Intensidad medida",
    texto:
      "Intervalos diseñados con control de ritmo cardiaco y recuperación activa. Intensidad, nunca improvisación.",
  },
  {
    icono: "diversity_3",
    titulo: "Grupos reducidos",
    texto:
      "Máximo 12 alumnas por sesión para que la coach acompañe cada repetición. Unidos somos más fuertes.",
  },
];

function PreviewHorario() {
  const porDia = DIAS.map((_, d) =>
    CLASES.filter((c) => c.day === d).sort((a, b) => a.hora.localeCompare(b.hora)),
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {DIAS.map((dia, d) => (
        <div key={dia} className="glass p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold uppercase tracking-[0.16em] text-white">
              {dia}
            </h3>
            <span className="chip">{porDia[d].length} clases</span>
          </div>
          <div className="my-4 hairline" />
          {porDia[d].length === 0 ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-dim">
              Estudio cerrado
            </p>
          ) : (
            <ul className="space-y-3">
              {porDia[d].map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{c.titulo}</p>
                    <p className="mt-0.5 text-xs text-muted-dim">{c.coach}</p>
                  </div>
                  <span className="whitespace-nowrap font-mono text-[11px] tracking-wider text-primary">
                    {c.hora}–{sumarMinutos(c.hora, c.duracion)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <NavPublica />

      {/* HERO */}
      <section className="relative overflow-hidden pb-20 pt-28 sm:pt-36">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="section relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-up">
            <span className="eyebrow">Estudio de entrenamiento funcional · Mujeres</span>
            <h1 className="mt-5 font-display text-[42px] font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Entrena con
              <br />
              <span className="gold-text">método</span>, no con
              <br />
              improvisación.
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-soft sm:text-lg">
              En UNIUM cada sesión está diseñada, guiada y medida. Grupos reducidos, coaches
              especializadas y un calendario claro para que lo único que tengas que decidir sea a
              qué hora entrenas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="btn-gold text-base">
                <Icono nombre="calendar_add_on" size={17} />
                AGENDAR CLASE
              </Link>
              <a href="#metodo" className="btn-ghost text-base">
                Conocer el método
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {METRICAS.map((m) => (
                <div key={m.etiqueta}>
                  <p className="font-display text-3xl font-bold gold-text">{m.valor}</p>
                  <p className="mt-1 font-mono text-[9.5px] uppercase leading-tight tracking-[0.14em] text-muted-dim">
                    {m.etiqueta}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md animate-fade-up">
            <div className="pointer-events-none absolute inset-6 animate-glow-pulse rounded-full bg-primary/15 blur-[80px]" />
            <Foto
              {...FOTOS.claseGrupal}
              prioridad
              className="relative aspect-[4/5] rounded-3xl border border-primary/20 shadow-gold"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="chip-gold">
                  <Icono nombre="location_on" size={12} />
                  {ESTUDIO.ciudad}
                </span>
                <p className="mt-3 font-display text-xl font-semibold uppercase leading-tight tracking-wide text-white">
                  Grupos de máximo
                  <br />
                  12 alumnas
                </p>
              </div>
            </Foto>
            <LogoCompleto className="absolute -left-2 -top-3 w-20 rounded-2xl border border-primary/25 bg-black shadow-gold sm:-left-6 sm:-top-6 sm:w-28" />
          </div>
        </div>
      </section>

      {/* PROMOCIONES publicadas desde el panel de administración */}
      <PromocionesInicio />

      {/* MÉTODO */}
      <section id="metodo" className="section scroll-mt-24 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <span className="eyebrow">El método UNIUM</span>
            <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
              Cuatro pilares en cada <span className="gold-text">sesión</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              No hay dos semanas iguales, pero sí una estructura: fuerza, movilidad, intensidad y
              acompañamiento. Todo medido, todo con propósito.
            </p>
            <Foto
              {...FOTOS.fuerza}
              className="mt-8 aspect-[4/3] rounded-2xl border border-white/10 lg:aspect-[3/4]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />
            </Foto>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {METODO.map((m) => (
              <article key={m.titulo} className="glass group p-6 transition hover:border-primary/30">
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                  <Icono nombre={m.icono} size={20} />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold uppercase tracking-wide text-white">
                  {m.titulo}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{m.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HORARIOS */}
      <section id="horarios" className="section scroll-mt-24 py-20">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">Calendario semanal</span>
            <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
              Horarios <span className="gold-text">disponibles</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm text-muted">
              Crea tu cuenta para ver los cupos en tiempo real y reservar con un solo clic.
            </p>
          </div>
          <Link href="/register" className="btn-gold shrink-0">
            <Icono nombre="person_add" size={17} />
            CREAR CUENTA
          </Link>
        </div>
        <div className="mt-10">
          <PreviewHorario />
        </div>
      </section>

      {/* COACHES */}
      <section id="coaches" className="section scroll-mt-24 py-20">
        <span className="eyebrow">Quién te acompaña</span>
        <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
          Nuestras <span className="gold-text">coaches</span>
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {COACHES.map((c) => (
            <article key={c.nombre} className="glass p-8 text-center">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-primary/30 bg-gold-gradient font-display text-2xl font-bold text-ink-900">
                {c.iniciales}
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold uppercase tracking-wide">
                {c.nombre}
              </h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                {c.especialidad}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted">{c.bio}</p>
            </article>
          ))}
        </div>
      </section>

      {/* UBICACIÓN */}
      <section id="ubicacion" className="section scroll-mt-24 py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Dónde entrenamos</span>
            <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
              El <span className="gold-text">estudio</span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted">
              Un espacio pensado al detalle: iluminación cálida, equipamiento premium y aforo
              limitado. Todo diseñado para que la sesión sea tuya.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icono: "location_on", texto: `${ESTUDIO.direccion} · ${ESTUDIO.ciudad}` },
                { icono: "call", texto: ESTUDIO.telefono },
                { icono: "mail", texto: ESTUDIO.email },
                { icono: "photo_camera", texto: ESTUDIO.instagram },
              ].map((i) => (
                <li key={i.icono} className="flex items-center gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-primary">
                    <Icono nombre={i.icono} size={16} />
                  </span>
                  <span className="text-sm text-muted-soft">{i.texto}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <Foto {...FOTOS.sala} className="aspect-video rounded-2xl border border-white/10" />
            <div className="glass overflow-hidden p-2">
              <iframe
                title="Ubicación del estudio UNIUM"
                src={ESTUDIO.mapa}
                className="h-[260px] w-full rounded-xl border-0 grayscale contrast-125"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="section py-20">
        <div className="glass-strong relative overflow-hidden px-6 py-14 text-center sm:px-16 sm:py-16">
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-primary/15 blur-[90px]" />
          <span className="eyebrow relative">Unidos somos más fuertes</span>
          <h2 className="relative mt-5 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
            Tu próxima clase te <span className="gold-text">está esperando</span>
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-sm text-muted">
            Crea tu cuenta, revisa el calendario de la semana y reserva tu cupo en segundos.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className="btn-gold text-base">
              <Icono nombre="calendar_add_on" size={17} />
              AGENDAR CLASE
            </Link>
            <Link href="/login" className="btn-ghost text-base">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10">
        <div className="section flex flex-col items-center justify-between gap-5 sm:flex-row">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-dim">
            © {new Date().getFullYear()} UNIUM Wellness Training
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70">
            {ESTUDIO.lema}
          </p>
          <Link
            href="/admin"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-dim transition hover:text-primary"
          >
            Acceso staff
          </Link>
        </div>
      </footer>
    </div>
  );
}

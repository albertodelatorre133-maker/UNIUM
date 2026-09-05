import Link from "next/link";
import { NavPublica } from "@/components/NavPublica";
import { Icono } from "@/components/Icono";
import { Foto } from "@/components/Foto";
import { LogoCompleto } from "@/components/Marca";
import { PromocionesInicio } from "@/components/PromocionesInicio";
import { CoachesInicio } from "@/components/CoachesInicio";
import { IntroMetodo, MetodoInicio } from "@/components/MetodoInicio";
import { HorarioInicio } from "@/components/HorarioInicio";
import { GrupoMaximoTexto, MetricasInicio } from "@/components/MetricasInicio";
import { ChipCiudad, LemaFooter, UbicacionInicio } from "@/components/EstudioInicio";
import { FOTOS } from "@/lib/seed";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <NavPublica />

      {/* HERO */}
      <section className="relative overflow-hidden pb-20 pt-28 sm:pt-36">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="section relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="animate-fade-up">
            <span className="eyebrow">Estudio de entrenamiento funcional y de fuerza</span>
            <h1 className="mt-4 lg:mt-5 font-display text-[42px] font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
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

            <MetricasInicio />
          </div>

          <div className="relative order-first mx-auto w-full max-w-md animate-fade-up lg:order-none">
            <div className="pointer-events-none absolute inset-6 animate-glow-pulse rounded-full bg-primary/15 blur-[80px]" />
            <Foto
              {...FOTOS.claseGrupal}
              prioridad
              className="relative aspect-[16/11] rounded-3xl border border-primary/20 shadow-gold sm:aspect-[4/5]"
              imgClassName="object-[58%_center]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <ChipCiudad />
                <p className="mt-3 font-display text-xl font-semibold uppercase leading-tight tracking-wide text-white">
                  <GrupoMaximoTexto />
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
            <IntroMetodo />
            <Foto
              {...FOTOS.fuerza}
              className="mt-8 aspect-[4/3] rounded-2xl border border-white/10 lg:aspect-[3/4]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />
            </Foto>
          </div>

          <MetodoInicio />
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
          <HorarioInicio />
        </div>
      </section>

      {/* COACHES publicadas desde el panel de administración */}
      <CoachesInicio />

      {/* UBICACIÓN */}
      <UbicacionInicio />

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
            <LemaFooter />
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

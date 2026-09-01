"use client";

import { useStore } from "@/lib/store";
import { inicialesDe } from "@/lib/texto";

/**
 * Equipo del estudio, gestionado desde /admin/coaches. Lee del mismo estado
 * que el panel de administración, así que lo que el staff publica aparece
 * aquí de inmediato.
 */
export function CoachesInicio() {
  const { hidratado, state } = useStore();
  if (!hidratado) return null;

  const coaches = state.coaches.filter((c) => c.activa);
  if (coaches.length === 0) return null;

  return (
    <section id="coaches" className="section scroll-mt-24 py-20">
      <span className="eyebrow">Quién te acompaña</span>
      <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
        {coaches.length === 1 ? (
          <>
            Tu <span className="gold-text">coach</span>
          </>
        ) : (
          <>
            Nuestras <span className="gold-text">coaches</span>
          </>
        )}
      </h2>
      <div
        className={`mt-10 grid gap-5 ${coaches.length === 1 ? "max-w-sm" : "md:grid-cols-3"}`}
      >
        {coaches.map((c) => (
          <article key={c.id} className="glass p-8 text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-primary/30 bg-gold-gradient font-display text-2xl font-bold text-ink-900">
              {inicialesDe(c.nombre)}
            </span>
            <h3 className="mt-6 font-display text-xl font-semibold uppercase tracking-wide">
              {c.nombre}
            </h3>
            {c.especialidad && (
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                {c.especialidad}
              </p>
            )}
            {c.bio && <p className="mt-4 text-sm leading-relaxed text-muted">{c.bio}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

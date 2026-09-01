import Link from "next/link";
import { LogoCompleto } from "./Marca";
import { ESTUDIO } from "@/lib/seed";

export function AuthShell({
  titulo,
  subtitulo,
  children,
  pie,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
  pie: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-4 py-7 corto:py-4 sm:px-5 sm:py-12">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]" />

      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-5 text-center corto:mb-3 sm:mb-7">
          <Link href="/" className="inline-block">
            <LogoCompleto className="mx-auto w-[104px] rounded-2xl border border-primary/15 bg-black corto:w-[74px] sm:w-36" />
          </Link>
        </div>

        <div className="glass-strong p-5 corto:p-4 sm:p-9">
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
            {titulo}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted sm:text-sm">{subtitulo}</p>
          <div className="my-5 hairline corto:my-3.5 sm:my-6" />
          {children}
        </div>

        <div className="mt-4 text-center text-[13px] text-muted corto:mt-3 sm:mt-5 sm:text-sm">{pie}</div>
        <p className="mt-5 text-center font-mono text-[9px] uppercase tracking-[0.22em] text-muted-dim corto:hidden sm:mt-7 sm:text-[10px]">
          {ESTUDIO.lema}
        </p>
      </div>
    </main>
  );
}

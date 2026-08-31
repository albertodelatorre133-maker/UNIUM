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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-14">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <LogoCompleto className="mx-auto w-40 rounded-2xl border border-primary/15 bg-black" />
          </Link>
        </div>

        <div className="glass-strong p-8 sm:p-10">
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight">{titulo}</h1>
          <p className="mt-2 text-sm text-muted">{subtitulo}</p>
          <div className="my-7 hairline" />
          {children}
        </div>

        <div className="mt-6 text-center text-sm text-muted">{pie}</div>
        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-muted-dim">
          {ESTUDIO.lema}
        </p>
      </div>
    </main>
  );
}

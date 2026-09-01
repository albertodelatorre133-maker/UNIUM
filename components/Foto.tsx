"use client";

import { useEffect, useRef, useState } from "react";
import { Isotipo } from "./Marca";

/**
 * Imagen del estudio con degradado a marcador de marca: si el archivo aún no
 * existe en `public/fotos/`, en lugar de una imagen rota se dibuja un panel
 * con el isotipo, de modo que la maquetación nunca se ve incompleta.
 */
export function Foto({
  src,
  respaldo,
  alt,
  className = "",
  imgClassName = "",
  prioridad = false,
  children,
}: {
  src: string;
  /** Imagen alternativa si `src` todavía no existe. */
  respaldo?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  prioridad?: boolean;
  children?: React.ReactNode;
}) {
  const [actual, setActual] = useState(src);
  const [falla, setFalla] = useState(false);
  const img = useRef<HTMLImageElement>(null);

  function alFallar() {
    if (respaldo && actual !== respaldo) {
      setActual(respaldo);
      return;
    }
    setFalla(true);
  }

  // El navegador puede fallar la descarga antes de que React hidrate y conecte
  // onError, así que al montar comprobamos también el estado real de la imagen.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) alFallar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actual]);

  return (
    <div className={`relative overflow-hidden bg-ink-700 ${className}`}>
      {falla ? (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,0.16),rgba(11,13,13,1)_70%)]">
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <Isotipo size={54} />
            <p className="max-w-[22ch] font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-muted-dim">
              {actual.replace("/fotos/", "")}
            </p>
          </div>
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          ref={img}
          key={actual}
          src={actual}
          alt={alt}
          loading={prioridad ? "eager" : "lazy"}
          onError={alFallar}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      )}
      {children}
    </div>
  );
}

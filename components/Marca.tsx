"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Imagen de marca con cadena de respaldo: si existe el archivo original del
 * logotipo (`/logo.png`, `/isotipo.png`) se usa ese; si no, la recreación en
 * SVG que viaja con el repositorio.
 */
function ImagenMarca({
  fuentes,
  alt,
  className = "",
  width,
  height,
}: {
  fuentes: string[];
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  const [indice, setIndice] = useState(0);
  const img = useRef<HTMLImageElement>(null);

  function siguiente() {
    setIndice((i) => (i < fuentes.length - 1 ? i + 1 : i));
  }

  // El navegador puede fallar la descarga antes de que React hidrate.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) siguiente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice]);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      ref={img}
      key={fuentes[indice]}
      src={fuentes[indice]}
      alt={alt}
      width={width}
      height={height}
      onError={siguiente}
      className={className}
    />
  );
}

const ISOTIPO = ["/isotipo.png", "/isotipo.svg"];
const LOGO = ["/logo.png", "/logo.svg"];

export function Isotipo({ size = 40 }: { size?: number }) {
  return (
    <ImagenMarca
      fuentes={ISOTIPO}
      alt="UNIUM"
      width={size}
      height={size}
      className="drop-shadow-[0_0_18px_rgba(212,175,55,0.35)]"
    />
  );
}

export function Marca({
  href = "/",
  size = 38,
  compacto = false,
}: {
  href?: string;
  size?: number;
  compacto?: boolean;
}) {
  return (
    <Link href={href} className="group flex items-center gap-3">
      <Isotipo size={size} />
      {!compacto && (
        <span className="leading-none">
          <span className="block font-display text-lg font-semibold tracking-[0.36em] gold-text">
            UNIUM
          </span>
          <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.28em] text-muted-dim">
            Wellness Training
          </span>
        </span>
      )}
    </Link>
  );
}

export function LogoCompleto({ className = "" }: { className?: string }) {
  return (
    <ImagenMarca
      fuentes={LOGO}
      alt="UNIUM Wellness Training — Unidos somos más fuertes"
      className={className}
    />
  );
}

import Link from "next/link";

export function Isotipo({ size = 40 }: { size?: number }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/isotipo.svg"
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
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/logo.svg"
      alt="UNIUM Wellness Training — Unidos somos más fuertes"
      className={className}
    />
  );
}

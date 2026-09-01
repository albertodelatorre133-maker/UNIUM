"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icono } from "./Icono";

export interface ItemNav {
  href: string;
  label: string;
  icono: string;
  /** Rutas hijas que también marcan este ítem como activo. */
  prefijos?: string[];
  /** Contador de pendientes que se dibuja sobre el icono. */
  badge?: number;
}

/** Barra de pestañas inferior: la navegación principal en móvil. */
export function BottomNav({ items }: { items: ItemNav[] }) {
  const pathname = usePathname();

  const activo = (item: ItemNav) =>
    pathname === item.href || (item.prefijos ?? []).some((p) => pathname.startsWith(p));

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-900/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg">
        {items.map((item) => {
          const on = activo(item);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-1 py-2.5 transition ${
                  on ? "text-primary" : "text-muted-dim"
                }`}
              >
                <span
                  className={`relative grid h-8 w-full max-w-[64px] place-items-center rounded-lg transition ${
                    on ? "bg-primary/12" : ""
                  }`}
                >
                  <Icono nombre={item.icono} size={18} />
                  {Boolean(item.badge) && (
                    <span className="absolute right-2 top-0 grid h-[16px] min-w-[16px] place-items-center rounded-full bg-gold-gradient px-1 font-mono text-[8px] font-semibold text-ink-900">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className="font-mono text-[8.5px] uppercase tracking-[0.12em]">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

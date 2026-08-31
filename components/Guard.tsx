"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Isotipo } from "./Marca";

function Cargando() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="animate-glow-pulse">
        <Isotipo size={64} />
      </div>
    </div>
  );
}

/** Protege un area privada y valida el rol requerido. */
export function Guard({
  rol,
  children,
}: {
  rol: "alumna" | "admin";
  children: React.ReactNode;
}) {
  const { hidratado, usuario } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!hidratado) return;
    if (!usuario) {
      router.replace(`/login?next=${rol === "admin" ? "/admin" : "/alumnas"}`);
      return;
    }
    if (rol === "admin" && usuario.role !== "admin") router.replace("/alumnas");
    if (rol === "alumna" && usuario.role === "admin") router.replace("/admin");
  }, [hidratado, usuario, rol, router]);

  if (!hidratado || !usuario) return <Cargando />;
  if (rol === "admin" && usuario.role !== "admin") return <Cargando />;

  return <>{children}</>;
}

export { Cargando };

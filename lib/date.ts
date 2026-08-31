export const DIAS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

export const DIAS_CORTOS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"] as const;

/** Indice de dia con Lunes = 0 ... Domingo = 6. */
export function dayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - dayIndex(d));
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

/** YYYY-MM-DD en horario local (evita el corrimiento de toISOString). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function hoyISO(): string {
  return toISODate(new Date());
}

export function formatoLargo(iso: string): string {
  const d = fromISODate(iso);
  return `${DIAS[dayIndex(d)]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

export function formatoCorto(iso: string): string {
  const d = fromISODate(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

/** Genera las horas seleccionables (cada 30 min) dentro de un rango operativo. */
export function franjasHorarias(apertura: string, cierre: string): string[] {
  const [ha, ma] = apertura.split(":").map(Number);
  const [hc, mc] = cierre.split(":").map(Number);
  const inicio = ha * 60 + ma;
  const fin = hc * 60 + mc;
  const out: string[] = [];
  for (let t = inicio; t <= fin - 30; t += 30) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
}

export function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + minutos;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function diasDesde(iso: string | null): number | null {
  if (!iso) return null;
  const diff = fromISODate(hoyISO()).getTime() - fromISODate(iso).getTime();
  return Math.round(diff / 86400000);
}

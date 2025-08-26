import { QuoteItem, QuoteResponse } from "@/types/IFinancingPreview";

const FALLBACK_PLANS = [
  { code: 1,  description: "3 CUOTAS",                       months: 3,  surchargePct: 0.30 },
  { code: 2,  description: "6 CUOTAS",                       months: 6,  surchargePct: 0.50 },
  { code: 5,  description: "6 CUOTAS S/I",                   months: 6,  surchargePct: 0.00 },
  { code: 4,  description: "PROMO 10 CUOTAS",                months: 10, surchargePct: 0.30 },
  { code: 3,  description: "12 CUOTAS",                      months: 12, surchargePct: 1.00 },
  { code: 10, description: "12 CUOTAS PRODUCTOS ALTO VALOR", months: 12, surchargePct: 0.50 },
  { code: 11, description: "CELU 18 CUOTAS + AURI",          months: 18, surchargePct: 1.80 },
  { code: 6,  description: "PROMO BICI 18 CUOTAS",           months: 18, surchargePct: 0.9455 },
];

export function localQuote(price: number, downPct = 0.15): QuoteResponse {
  const downAmount = price * downPct;
  const balance = Math.max(0, price - downAmount);
  const items: QuoteItem[] = FALLBACK_PLANS.map(p => {
    const total = balance * (1 + p.surchargePct);
    const monthly = total / p.months;
    return {
      code: p.code,
      description: p.description,
      months: p.months,
      surchargePct: p.surchargePct,
      monthly, total, downAmount, downPct,
    };
  }).sort((a,b) => a.months - b.months || a.surchargePct - b.surchargePct);
  return { price, downPct, items };
}

export function badgeFor(p: QuoteItem) {
  if (p.surchargePct === 0) return { text: "Sin interés", cls: "bg-emerald-100 text-emerald-700" };
  if (p.description.toUpperCase().includes("PROMO")) return { text: "Promo", cls: "bg-indigo-100 text-indigo-700" };
  return { text: "Estándar", cls: "bg-gray-100 text-gray-700" };
}

export function dedupeBest(items: QuoteItem[]) {
  // un plan por cantidad de cuotas: el de menor recargo
  const byMonths = new Map<number, QuoteItem>();
  for (const it of items) {
    const cur = byMonths.get(it.months);
    if (!cur || it.surchargePct < cur.surchargePct) byMonths.set(it.months, it);
  }
  return [...byMonths.values()].sort((a,b) => a.months - b.months || a.surchargePct - b.surchargePct);
}

export function money(n: number) {
  try {
    return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });
  } catch { return `$ ${n.toFixed(2)}`; }
}
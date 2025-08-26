"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, CreditCard, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteResponse } from "@/types/IFinancingPreview";
import { localQuote, badgeFor, dedupeBest, money } from "@/lib/Quotes";


export default function FinancingWidget({
  price,
  groupKey,
}: {
  price: number;
  groupKey?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"best"|"all">("best");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams({ price: String(price) });
        if (groupKey) qs.set("groupKey", groupKey);
        const res = await fetch(`/api/financing/quote?${qs.toString()}`, { cache: "no-store" });
        if (!alive) return;

        if (res.ok) {
          const data = (await res.json()) as QuoteResponse;
          const items = [...(data.items || [])].sort((a,b)=>a.months - b.months || a.surchargePct - b.surchargePct);
          setQuote({ price: data.price, downPct: data.downPct, items });
        } else {
          setQuote(localQuote(price));
        }
      } catch {
        setQuote(localQuote(price));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [price, groupKey]);

  const best = useMemo(() => quote ? dedupeBest(quote.items) : [], [quote]);
  const minMonthly = useMemo(() =>
    best.length ? Math.min(...best.map(i => i.monthly)) : 0
  , [best]);

  if (loading) {
    return (
      <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Calculando financiación…
      </div>
    );
  }
  if (!quote) return null;

  // ---- Caja compacta en la card: "Desde $X/mes" + botón
  return (
    <>
      <div className="mt-1 flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-1 text-gray-700">
          <CreditCard className="h-4 w-4" />
          <span>Desde <b>{money(minMonthly)}</b>/mes</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-emerald-700 hover:underline"
        >
          Ver planes
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-end sm:items-center justify-center p-3"
             onClick={() => setOpen(false)}>
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-[720px] max-h-[85vh] overflow-hidden"
               onClick={(e)=>e.stopPropagation()}>
            {/* Header */}
            <div className="px-4 py-3 border-b">
              <div className="text-sm font-semibold">Planes de financiación</div>
              <div className="text-[12px] text-gray-500">
                Precio: {money(quote.price)} · Anticipo {Math.round((quote.downPct ?? 0)*100)}%
              </div>
              {/* tabs */}
              <div className="mt-3 flex gap-2">
                <button
                  className={`px-3 py-1 text-xs rounded-full border ${tab==="best" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-600"}`}
                  onClick={()=>setTab("best")}
                >
                  Mejores (1 por cuota)
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-full border ${tab==="all" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-600"}`}
                  onClick={()=>setTab("all")}
                >
                  Todas
                </button>
              </div>
            </div>

            {/* Listado */}
            <div className="p-3 overflow-y-auto" style={{ maxHeight: "70vh" }}>
              <ul className="space-y-2">
                {(tab==="best" ? best : quote.items).map((q) => {
                  const badge = badgeFor(q);
                  return (
                    <li key={`${tab}-${q.code}-${q.months}-${q.surchargePct}`} className="border rounded-md p-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">
                          {q.months} cuotas
                          <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${badge.cls}`}>
                            {badge.text}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-emerald-700">
                          {money(q.monthly)}/mes
                        </div>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-600">
                        <span className="flex items-center gap-1">
                          <BadgePercent className="h-3 w-3" /> Recargo {Math.round(q.surchargePct*100)}%
                        </span>
                        <span>Total {money(q.total)}</span>
                        <span>Anticipo {money(q.downAmount)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-3 text-[11px] text-gray-500">
                * Valores estimativos. Confirmar condiciones al cerrar la venta.
              </div>
            </div>

            <div className="px-4 py-3 border-t bg-gray-50 flex justify-end">
              <Button onClick={()=>setOpen(false)} className="text-sm">Listo</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

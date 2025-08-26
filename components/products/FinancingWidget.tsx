"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, CreditCard, BadgePercent, ChevronDown, ChevronUp } from "lucide-react";
import { QuoteItem, QuoteResponse } from "@/types/IFinancingPreview";
import { money, localQuote, dedupeBest } from "@/lib/Quotes";

export default function FinancingInline({
  itemId,
  price,
  groupKey,
  downPctOverride,
  onSelect,
  allowedPlanIds, // ← Cambiado de allowedCodes a allowedPlanIds
  initialMonths,
  allowCash = true,
}: {
  itemId: string;
  price: number;
  groupKey?: string;
  downPctOverride?: number | null;
  onSelect?: (itemId: string, plan: QuoteItem | null) => void;
  allowedPlanIds?: string[]; // ← Ahora es array de strings (ObjectIds)
  initialMonths?: number;
  allowCash?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<number | null>(initialMonths ?? null);
  

useEffect(() => {
  let alive = true;
  (async () => {
    try {
      setLoading(true);
      const qs = new URLSearchParams({ price: String(price) });
      if (groupKey) qs.set("groupKey", groupKey);
      if (downPctOverride != null) qs.set("downPct", String(downPctOverride));
      if (allowedPlanIds?.length) qs.set("planIds", allowedPlanIds.join(",")); // ⬅️ nuevo

      const res = await fetch(`/api/financing/quote?${qs.toString()}`, { cache: "no-store" });
      if (!alive) return;

      if (res.ok) {
        const data = (await res.json()) as QuoteResponse;
        const items = [...(data.items || [])].sort(
          (a, b) => a.months - b.months || a.surchargePct - b.surchargePct
        );
        setQuote({ price: data.price, downPct: data.downPct, items });
      } else {
        setQuote(localQuote(price, downPctOverride ?? 0.15));
      }
    } catch {
      setQuote(localQuote(price, downPctOverride ?? 0.15));
    } finally {
      if (alive) setLoading(false);
    }
  })();
  return () => { alive = false; };
  // ⬇️ importante: si cambian los planes permitidos, rehacer el fetch
}, [price, groupKey, downPctOverride, allowedPlanIds]);

  const best = useMemo(() => {
  if (!quote) return [];

  // defensivo: por si el backend no filtró
  const filtered =
    allowedPlanIds?.length
      ? quote.items.filter((p: any) => p.planId && allowedPlanIds.includes(p.planId))
      : quote.items;

  const ordered = [...filtered].sort(
    (a, b) => a.months - b.months || a.surchargePct - b.surchargePct
  );

  return dedupeBest(ordered);
}, [quote, allowedPlanIds]);

  const top = useMemo(() => best.slice(0, 3), [best]);

  function choose(months: number) {
    setSelected(months);
    if (!quote) return;

    // buscar dentro de `best` (ya filtrado)
    const plan = best.find((p) => p.months === months) ?? null;
    onSelect?.(itemId, plan);
  }

  function chooseCash() {
    setSelected(0);
    onSelect?.(itemId, null);
  }

  if (loading) {
    return (
      <div className="mt-2 text-[12px] text-gray-600 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Calculando financiación…
      </div>
    );
  }
  if (!quote) return null;

  return (
    <div className="mt-2 rounded-md border p-2 bg-white">
      <details open={expanded} className="group">
        <summary
          onClick={(e) => {
            e.preventDefault();
            setExpanded((v) => !v);
          }}
          className="list-none flex items-center justify-between cursor-pointer"
        >
          <div className="text-[12px] text-gray-700 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Financiación (anticipo {Math.round((quote.downPct ?? 0) * 100)}%)</span>
          </div>
          <span className="text-[12px] text-emerald-700 flex items-center gap-1 select-none">
            {expanded ? (
              <>
                Ocultar <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Ver planes <ChevronDown className="h-4 w-4" />
              </>
            )}
          </span>
        </summary>

        {/* Compacto */}
        {!expanded && (
          <div className="mt-2 grid grid-cols-1 gap-2">
            {allowCash && (
              <button
                key="cash-top"
                type="button"
                onClick={chooseCash}
                className={`w-full text-left border rounded-md px-3 py-2 text-[12px] ${
                  selected === 0 ? "border-emerald-400 bg-emerald-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">Contado (sin financiación)</div>
                  <div className="font-semibold text-emerald-700">{money(price)}</div>
                </div>
                <div className="text-[11px] text-gray-600 mt-0.5">Pago único — Total {money(price)}</div>
              </button>
            )}

            {top.map((p) => (
              <button
                key={`top-${p.months}`}
                type="button"
                onClick={() => choose(p.months)}
                className={`w-full text-left border rounded-md px-3 py-2 text-[12px] ${
                  selected === p.months ? "border-emerald-400 bg-emerald-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">
                    {p.months} cuotas {p.surchargePct === 0 && <span className="ml-1 text-emerald-700">(s/ interés)</span>}
                  </div>
                  <div className="font-semibold text-emerald-700">{money(p.monthly)}/mes</div>
                </div>
                <div className="text-[11px] text-gray-600 mt-0.5 flex flex-wrap gap-x-3">
                  <span className="flex items-center gap-1">
                    <BadgePercent className="h-3 w-3" /> Recargo {Math.round(p.surchargePct * 100)}%
                  </span>
                  <span>Total {money(p.total)}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Expandido */}
        {expanded && (
          <div className="mt-2 grid grid-cols-1 gap-2 max-h-48 overflow-auto pr-1">
            {allowCash && (
              <button
                key="cash-all"
                type="button"
                onClick={chooseCash}
                className={`w-full text-left border rounded-md px-3 py-2 text-[12px] ${
                  selected === 0 ? "border-emerald-400 bg-emerald-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">Contado (sin financiación)</div>
                  <div className="font-semibold text-emerald-700">{money(price)}</div>
                </div>
                <div className="text-[11px] text-gray-600 mt-0.5">Pago único — Total {money(price)}</div>
              </button>
            )}

            {best.map((p) => (
              <button
                key={`all-${p.months}`}
                type="button"
                onClick={() => choose(p.months)}
                className={`w-full text-left border rounded-md px-3 py-2 text-[12px] ${
                  selected === p.months ? "border-emerald-400 bg-emerald-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">
                    {p.months} cuotas {p.surchargePct === 0 && <span className="ml-1 text-emerald-700">(s/ interés)</span>}
                  </div>
                  <div className="font-semibold text-emerald-700">{money(p.monthly)}/mes</div>
                </div>
                <div className="text-[11px] text-gray-600 mt-0.5 flex flex-wrap gap-x-3">
                  <span className="flex items-center gap-1">
                    <BadgePercent className="h-3 w-3" /> Recargo {Math.round(p.surchargePct * 100)}%
                  </span>
                  <span>Total {money(p.total)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </details>

      {/* Mini leyenda de selección */}
      {selected != null && (
        <div className="mt-2 text-[11px] text-gray-600">
          {selected === 0 ? (
            <>Seleccionado: <b>Contado</b>. Total {money(price)}.</>
          ) : (
            <>Seleccionado: <b>{selected} cuotas</b>. Esto es una referencia; se confirma al cerrar la venta.</>
          )}
        </div>
      )}
    </div>
  );
}
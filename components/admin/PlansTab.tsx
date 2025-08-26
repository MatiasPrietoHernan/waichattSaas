
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { FinancingGroup, FinancingPlan } from "@/types/IFinancing";


const pctToStr = (n?: number | null) =>
  Number.isFinite(n as number) ? Math.round(((n ?? 0) * 100 + Number.EPSILON) * 100) / 100 : 0;
const strToPct = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? n / 100 : 0;
};

const numberOrNull = (v: string) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const pctBadge = (p = 0) => `${pctToStr(p)}%`;




function PlansTab() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<FinancingGroup[]>([]);
  const [items, setItems] = useState<FinancingPlan[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // filtros
  const [q, setQ] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [onlyActive, setOnlyActive] = useState(true);

  const blank = {
    code: undefined as number | undefined,
    description: "",
    months: 3,
    surchargePct: 0,
    groupKey: "default",
    active: true,
    minPrice: null as number | null,
    maxPrice: null as number | null,
    includeCategories: [] as string[],
    excludeCategories: [] as string[],
  };
  const [form, setForm] = useState<FinancingPlan>(blank);

  const load = async () => {
    try {
      const [rg, rp] = await Promise.all([fetch("/api/financing/groups"), fetch("/api/financing/plans")]);
      const dg = await rg.json();
      const dp = await rp.json();
      setGroups(dg.groups ?? []);
      setItems(dp.plans ?? []);
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los planes", variant: "destructive" });
    }
  };

  useEffect(() => {
    load();
  }, []);

  // lista con filtros bonitos
  const filtered = useMemo(() => {
    let arr = [...items];
    if (groupFilter !== "all") arr = arr.filter((p) => (p.groupKey ?? "default") === groupFilter);
    if (onlyActive) arr = arr.filter((p) => p.active);
    const qq = q.trim().toLowerCase();
    if (qq) {
      arr = arr.filter(
        (p) =>
          (p.description ?? "").toLowerCase().includes(qq) ||
          String(p.code ?? "").includes(qq) ||
          String(p.months ?? "").includes(qq)
      );
    }
    return arr.sort(
      (a, b) => Number(b.active) - Number(a.active) || (a.months ?? 0) - (b.months ?? 0)
    );
  }, [items, q, onlyActive, groupFilter]);

  const reset = () => setForm(blank);

  const save = async () => {
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/financing/plans/${editingId}` : "/api/financing/plans";
    try {
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      toast({ title: "Listo", description: "Plan guardado correctamente" });
      setEditingId(null);
      reset();
      load();
    } catch {
      toast({ title: "Error", description: "No se pudo guardar el plan", variant: "destructive" });
    }
  };

  const del = async (id: string) => {
    if (!confirm("¿Eliminar plan?")) return;
    try {
      const r = await fetch(`/api/financing/plans/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast({ title: "Eliminado", description: "Plan eliminado" });
      load();
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* listado */}
      <Card className="md:col-span-2">
        <CardHeader className="space-y-3">
          <CardTitle>Planes</CardTitle>

          <div className="grid sm:grid-cols-3 gap-2">
            <Input
              placeholder="Buscar por descripción / meses / código…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="h-10 rounded-md border px-2 bg-white"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="all">Todos los grupos</option>
              <option value="default">default</option>
              {groups.map((g) => (
                <option key={g._id} value={g.key}>
                  {g.name}
                </option>
              ))}
            </select>

            <label className="h-10 rounded-md border px-3 flex items-center gap-2 text-sm bg-white">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
              />
              Solo activos
            </label>
          </div>
        </CardHeader>

        <CardContent className="divide-y">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4">Sin resultados con estos filtros.</div>
          ) : (
            filtered.map((p) => (
              <div key={p._id} className="py-3 flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-center w-16">
                  <span className="text-[11px] text-muted-foreground">Meses</span>
                  <span className="text-base font-semibold">{p.months}</span>
                </div>

                <div className="flex-1">
                  <div className="font-medium">{p.description}</div>
                  <div className="text-[12px] text-muted-foreground flex flex-wrap gap-2">
                    <span>recargo {pctBadge(p.surchargePct)}</span>
                    <span>• grupo {(p.groupKey ?? "default")}</span>
                    {p.minPrice != null && <span>• min ${p.minPrice}</span>}
                    {p.maxPrice != null && <span>• max ${p.maxPrice}</span>}
                    {!p.active && <span className="text-red-500">• inactivo</span>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(p._id!);
                      setForm({
                        _id: p._id,
                        code: p.code,
                        description: p.description ?? "",
                        months: p.months ?? 1,
                        surchargePct: p.surchargePct ?? 0,
                        groupKey: p.groupKey ?? "default",
                        active: !!p.active,
                        minPrice: p.minPrice ?? null,
                        maxPrice: p.maxPrice ?? null,
                        includeCategories: p.includeCategories ?? [],
                        excludeCategories: p.excludeCategories ?? [],
                      });
                    }}
                  >
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => del(p._id!)}>Eliminar</Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* form */}
      <Card className="md:sticky md:top-6 md:h-fit">
        <CardHeader>
          <CardTitle>{editingId ? "Editar plan" : "Nuevo plan"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Código (opcional)</Label>
              <Input
                value={form.code ?? ""}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>
            <div>
              <Label>Meses</Label>
              <Input
                type="number"
                value={form.months}
                onChange={(e) => setForm({ ...form, months: Number(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div>
            <Label>Descripción</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Recargo (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={pctToStr(form.surchargePct)}
                onChange={(e) => setForm({ ...form, surchargePct: strToPct(e.target.value) })}
              />
            </div>
            <div>
              <Label>Grupo</Label>
              <select
                className="h-10 rounded-md border px-2 w-full bg-white"
                value={form.groupKey ?? "default"}
                onChange={(e) => setForm({ ...form, groupKey: e.target.value })}
              >
                <option value="default">default</option>
                {groups
                  .filter((g) => g.active)
                  .map((g) => (
                    <option key={g._id} value={g.key}>
                      {g.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Mín. precio (opcional)</Label>
              <Input
                type="number"
                value={form.minPrice ?? ""}
                onChange={(e) => setForm({ ...form, minPrice: numberOrNull(e.target.value) })}
              />
            </div>
            <div>
              <Label>Máx. precio (opcional)</Label>
              <Input
                type="number"
                value={form.maxPrice ?? ""}
                onChange={(e) => setForm({ ...form, maxPrice: numberOrNull(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categorías incluidas (coma)</Label>
              <Input
                value={(form.includeCategories ?? []).join(",")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    includeCategories: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
            <div>
              <Label>Categorías excluidas (coma)</Label>
              <Input
                value={(form.excludeCategories ?? []).join(",")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    excludeCategories: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="plan-active"
              type="checkbox"
              checked={!!form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <Label htmlFor="plan-active">Activo</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={save}>{editingId ? "Guardar cambios" : "Crear plan"}</Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  reset();
                }}
              >
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default PlansTab;
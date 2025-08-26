"use client";
import { useEffect, useMemo, useState } from "react";
import type { FinancingGroup, FinancingPlan } from "@/types/IFinancing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

function GroupsTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<FinancingGroup[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FinancingGroup>({
    key: "",
    name: "",
    description: "",
    order: 0,
    active: true,
  });

  const load = async () => {
    try {
      const r = await fetch("/api/financing/groups");
      const d = await r.json();
      setItems(d.groups ?? []);
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los grupos", variant: "destructive" });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (g) =>
        g.key?.toLowerCase().includes(q) ||
        g.name?.toLowerCase().includes(q) ||
        (g.description ?? "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const resetForm = () =>
    setForm({ key: "", name: "", description: "", order: 0, active: true });

  const save = async () => {
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/financing/groups/${editingId}` : "/api/financing/groups";
    try {
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      toast({ title: "Listo", description: "Grupo guardado correctamente" });
      setEditingId(null);
      resetForm();
      load();
    } catch {
      toast({ title: "Error", description: "No se pudo guardar el grupo", variant: "destructive" });
    }
  };

  const del = async (id: string) => {
    if (!confirm("¿Eliminar grupo?")) return;
    try {
      const r = await fetch(`/api/financing/groups/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast({ title: "Eliminado", description: "Grupo eliminado" });
      load();
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* list */}
      <Card className="md:col-span-2">
        <CardHeader className="space-y-2">
          <CardTitle>Grupos</CardTitle>
          <Input
            placeholder="Buscar por key / nombre / descripción…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </CardHeader>
        <CardContent className="divide-y">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4">No hay resultados.</div>
          ) : (
            filtered.map((g) => (
              <div key={g._id} className="py-3 flex items-center gap-3">
                <div className="hidden sm:block w-28 text-xs font-mono text-muted-foreground">{g.key}</div>
                <div className="flex-1">
                  <div className="font-medium">{g.name}</div>
                  <div className="text-[12px] text-muted-foreground">
                    orden {g.order} {g.active ? "• activo" : "• inactivo"}
                    {g.description ? ` • ${g.description}` : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(g._id!);
                      setForm({
                        _id: g._id,
                        key: g.key,
                        name: g.name,
                        description: g.description,
                        order: g.order ?? 0,
                        active: !!g.active,
                      });
                    }}
                  >
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => del(g._id!)}>Eliminar</Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* form */}
      <Card className="md:sticky md:top-6 md:h-fit">
        <CardHeader>
          <CardTitle>{editingId ? "Editar grupo" : "Nuevo grupo"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Key (slug único)</Label>
            <Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} />
          </div>
          <div>
            <Label>Nombre</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Descripción</Label>
            <Input
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Orden</Label>
              <Input
                type="number"
                value={form.order ?? 0}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Activo
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={save}>{editingId ? "Guardar cambios" : "Crear grupo"}</Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  resetForm();
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

export default GroupsTab;
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Package, CreditCard } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import {buildWhatsAppText, toMoney, openWhatsApp, SHIPPING_FLAT} from "@/lib/checkoutform"
import type { QuoteItem } from "@/types/IFinancingPreview";
import { CheckoutFormProps} from '@/types/ICheckoutform'
import FinancingInline from "../products/FinancingWidget";


export function CheckoutForm({ items, totalPrice, onBack, onClose }: CheckoutFormProps) {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";

  const [loading, setLoading] = useState(false);
  const [needsShipping, setNeedsShipping] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "" });

  // selección de planes por ítem (id -> plan elegido; null = contado)
  const [selectedPlans, setSelectedPlans] = useState<Record<string, QuoteItem | null>>({});

  const { clearCart } = useCart();
  const { toast } = useToast();

  function handlePlanSelect(itemId: string, plan: QuoteItem | null) {
    setSelectedPlans((prev) => ({ ...prev, [itemId]: plan }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name) {
      toast({ title: "Campos requeridos", description: "Por favor completa nombre", variant: "destructive" });
      return;
    }
    if (needsShipping && !formData.address) {
      toast({ title: "Dirección requerida", description: "Por favor ingresa tu dirección de envío", variant: "destructive" });
      return;
    }

    setLoading(true);

    // 1) Preparamos y abrimos WhatsApp YA (evita bloqueo de popups)
    const shippingCost = needsShipping ? SHIPPING_FLAT : 0;
    const waText = buildWhatsAppText({
      name: formData.name,
      items,
      selectedPlans,
      subtotal: totalPrice,
      shipping: shippingCost,
      needsShipping,
      address: formData.address,
    });
    openWhatsApp(waText);

    try {
      // 2) Notificás a tu backend / webhook (opcional)
      const res = await fetch(`/api/token?id=${id}`);
      const data = await res.json();

      await fetch(process.env.NEXT_PUBLIC_URL_WEBHOOK || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            title: item.name,
            unit_price: item.price,
            quantity: item.quantity,
            financing: selectedPlans[item.id] ?? null, // null = contado
          })),
          totalPrice,
          needsShipping,
          formData,
        }),
      });

      toast({ title: "¡Pedido realizado!", description: `Gracias ${formData.name}, te escribimos por WhatsApp 👋` });
      clearCart();
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No pudimos procesar el pedido. Intenta nuevamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = totalPrice + (needsShipping ? SHIPPING_FLAT : 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="font-semibold text-gray-900">Finalizar Pedido</h3>
          <p className="text-sm text-gray-600">Completa tus datos</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Datos del cliente */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Datos del Cliente</h4>

          <div>
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Tu nombre completo"
              required
            />
          </div>
        </div>

        {/* Envío */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Envío</h4>

          <div className="flex items-center gap-2">
            <Checkbox
              id="shipping"
              checked={needsShipping}
              onCheckedChange={(checked) => setNeedsShipping(!!checked)}
            />
            <Label htmlFor="shipping" className="text-sm">
              Necesito envío a domicilio (+{toMoney(SHIPPING_FLAT)})
            </Label>
          </div>

          {needsShipping && (
            <div>
              <Label htmlFor="address">Dirección de Envío *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle, número, barrio, ciudad, CP"
                rows={3}
                required
              />
            </div>
          )}
        </div>

        {/* Resumen del pedido + financiación por ítem */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Resumen del Pedido
          </h4>

          <div className="space-y-3 text-sm">
            {items.map((item) => {
               const lineTotal = item.price * item.quantity;

              const fin = (item as any).financing as
                | {
                    mode: "inherit" | "override" | "disabled";
                    groupKey?: string | null;
                    downPct?: number | null;
                    planIds?: string[]; // ← CAMBIO: ahora es planIds en lugar de codes
                  }
                | undefined;

              const finMode = fin?.mode ?? "inherit";
              const groupKey =
                finMode === "override" ? fin?.groupKey ?? undefined : undefined;
              const downPctOverride =
                finMode === "override" ? fin?.downPct ?? null : null;
              const allowedPlanIds = // ← CAMBIO: ahora es allowedPlanIds
                finMode === "override" ? fin?.planIds ?? undefined : undefined;

              console.log('🎯 DEBUG CheckoutForm - item:', item.name);
              console.log('🎯 DEBUG CheckoutForm - financing:', fin);
              console.log('🎯 DEBUG CheckoutForm - allowedPlanIds:', allowedPlanIds);

              const renderFinancing =
                finMode !== "disabled" &&
                !(finMode === "override" && Array.isArray(allowedPlanIds) && allowedPlanIds.length === 0);

              return (
                <div key={item.id} className="rounded-md border bg-white">
                  {/* Encabezado de línea */}
                  <div className="flex items-start justify-between p-3">
                    <div className="pr-2">
                      <span className="text-gray-800 font-medium">{item.name}</span>
                      <span className="text-gray-600"> x{item.quantity}</span>
                    </div>
                    <span className="font-semibold">{toMoney(lineTotal)}</span>
                  </div>

                  {/* Financiación inline */}
                  <div className="border-t p-3">
                                          {renderFinancing && (
                          <FinancingInline
                            itemId={item.id}
                            price={lineTotal}
                            groupKey={groupKey}
                            downPctOverride={downPctOverride ?? undefined}
                            onSelect={handlePlanSelect}
                            allowedPlanIds={allowedPlanIds}
                          />
                        )}

                    {/* Mini resumen de elección (incluye "contado") */}
                    {Object.prototype.hasOwnProperty.call(selectedPlans, item.id) &&
                      (selectedPlans[item.id] ? (
                        <div className="mt-2 text-[12px] text-gray-600">
                          Elegiste: <b>{selectedPlans[item.id]!.months} cuotas</b> (
                          {Math.round(selectedPlans[item.id]!.surchargePct * 100)}% recargo) — {selectedPlans[item.id]!.description}.
                          <br />
                          Estimado: {toMoney(selectedPlans[item.id]!.monthly)}/mes · Total {toMoney(selectedPlans[item.id]!.total)}
                        </div>
                      ) : (
                        <div className="mt-2 text-[12px] text-gray-600">
                          Elegiste: <b>Pago al contado</b>. Total {toMoney(lineTotal)}.
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}

            {/* Subtotales */}
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{toMoney(totalPrice)}</span>
            </div>

            {needsShipping && (
              <div className="flex justify-between">
                <span className="text-gray-600">Envío:</span>
                <span className="font-medium">{toMoney(SHIPPING_FLAT)}</span>
              </div>
            )}

            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total:</span>
              <span>{toMoney(finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {loading ? "Procesando..." : (<><CreditCard className="h-4 w-4 mr-2" /> Finalizar Pedido ({toMoney(finalTotal)})</>)}
          </Button>
        </div>
      </form>
    </div>
  );
}
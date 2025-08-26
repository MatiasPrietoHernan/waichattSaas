import type { QuoteItem } from "@/types/IFinancingPreview";

export const toMoney = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });

/**
 * Genera el texto para WhatsApp con estilo “marketing”
 * usando los mismos parámetros de siempre.
 */
export function buildWhatsAppText(opts: {
  name: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  selectedPlans: Record<string, QuoteItem | null>;
  subtotal: number;
  shipping: number;
  needsShipping: boolean;
  address?: string;
}) {
  const { name, items, selectedPlans, subtotal, shipping, needsShipping, address } = opts;

  // Tagline simple por producto (heurística por nombre).
  const taglineFor = (productName: string): string => {
    const n = productName.toLowerCase();
    if (n.includes("5g")) return "¡El último modelo en tecnología 5G! 🚀";
    if (/\ba5\b/i.test(productName)) return "¡Potencia y estilo en un solo dispositivo! 💪";
    if (/\ba3\b/i.test(productName)) return "¡Una excelente opción para todos! 👌";
    return "¡Gran elección para tu día a día! ✨";
  };

  const lines: string[] = [];

  // Encabezado
  lines.push(`Cliente: ${name} 👨`);
  lines.push("");
  lines.push("¡Aprovecha al Máximo tus Compras! 📈");
  lines.push("");

  // Detalle de productos con copy
  items.forEach((it) => {
    const lineTotal = it.price * it.quantity;

    // título + tagline
    lines.push(`- ${it.name}: ${taglineFor(it.name)}`);

    // contado o financiación (si no hay selección, tratamos como contado)
    const selExists = Object.prototype.hasOwnProperty.call(selectedPlans, it.id);
    const sel = selExists ? selectedPlans[it.id] : null;

    if (!sel) {
      lines.push(`- Precio contado: ${toMoney(lineTotal)} 💸`);
      lines.push(`- ¡Ahorra dinero con nuestra opción de contado!`);
    } else {
      lines.push(`- Precio financiado: ${sel.months} cuotas de ${toMoney(sel.monthly)} 📊`);
      lines.push(`- ¡Total: ${toMoney(sel.total)}! 💸`);
    }
  });

  // Resumen
  lines.push("");
  lines.push("¡Resumen de tu Compra! 📝");
  lines.push("");
  lines.push(`- Subtotal: ${toMoney(subtotal)}`);
  if (needsShipping) {
    if (address) lines.push(`- Dirección: ${address}`);
    lines.push(`- Envío: ${toMoney(shipping)}`);
  }
  const total = subtotal + (needsShipping ? shipping : 0);
  lines.push(`- Total estimado: ${toMoney(total)}`);
  lines.push("");

  // Beneficios (los dos que pediste)
  lines.push("¡Beneficios Exclusivos! 🎁");
  lines.push("");
  lines.push(`- ¡Envío rápido y seguro!`);
  lines.push(`- ¡Soporte técnico especializado!`);
  lines.push("");

  // CTA
  lines.push("¡No Pierdas esta Oportunidad! ⏰");
  lines.push("¿Qué esperas? ¡Haz tu pedido ahora y aprovecha al máximo nuestros beneficios!");

  return lines.join("\n");
}

const SHOP_WA = process.env.NEXT_PUBLIC_WA_PHONE || "5493816592823"; // nro SIN '+'
export const SHIPPING_FLAT = 10;

export function openWhatsApp(preparedText: string) {
  const phone = SHOP_WA.replace(/[^\d]/g, "");
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(preparedText)}`;

  // Abrimos primero (gesto de usuario) y luego seteamos la URL
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (win) {
    win.location.href = url;
  } else {
    // Fallback si el popup fue bloqueado
    window.location.href = url;
  }
}

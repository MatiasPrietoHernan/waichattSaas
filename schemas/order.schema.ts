import { Schema, model, models, Types } from "mongoose";

/** === Tipos auxiliares (TS) === */
export const ORDER_STATUSES = ["en_proceso", "vendido", "cancelado"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItemFinancingSnapshot {
  // Ref real al plan (si existía al momento de crear la orden)
  planRef?: Types.ObjectId | null;

  // Snapshot para inmutabilidad:
  modeApplied: "inherit" | "override" | "disabled"; // cómo quedó resuelto en el producto
  groupKey?: string | null;

  // Identificación del plan y condiciones al momento de la venta
  planCode?: number | null;     // coincide con FinancingPlan.code
  months?: number | null;       // FinancingPlan.months
  surchargePct?: number | null; // FinancingPlan.surchargePct (ej: 0.30 = 30%)
  downPct?: number | null;      // anticipo aplicado (si corresponde)

  // Compatibilidad con forma simple (lista de planes habilitados)
  planIds?: Types.ObjectId[];   // <-- agregado para compatibilidad

  // Cálculos guardados (para auditoría):
  surchargeAmount?: number | null;        // recargo total en $ por el ítem
  totalWithSurcharge?: number | null;     // total del ítem con recargo
  installmentAmount?: number | null;      // valor de cada cuota
}

export interface OrderItem {
  productId: Types.ObjectId;   // ref Product
  productTitle: string;        // snapshot
  category: string;            // snapshot
  subcategory?: string | null; // snapshot

  unitPrice: number;           // precio unitario elegido (sales_price o price)
  quantity: number;

  // Financiación elegida + snapshot del plan
  financing?: OrderItemFinancingSnapshot;

  // Totales por ítem
  subTotal: number; // unitPrice * quantity (antes de recargo)
  grandTotal: number; // con recargos y descuentos aplicados a nivel ítem (si existieran)
}

export interface OrderTotals {
  itemsSubTotal: number;       // suma de subTotal
  surchargeTotal: number;      // suma de recargos de todos los ítems
  discountTotal: number;       // si aplicás cupones/descuentos
  shippingTotal: number;       // si aplicás envío
  grandTotal: number;          // total a pagar
}

export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string | null;
  docNumber?: string | null; // DNI/CUIT si aplica
}

export interface OrderDocument {
  _id: Types.ObjectId;
  orderNumber?: string; // opcional: código amigable
  status: OrderStatus;

  customer: OrderCustomer;
  items: OrderItem[];

  notes?: string | null;
  shipping?: string | null; // <-- agregado para compatibilidad simple
  currency: "ARS" | "USD";
  totals: OrderTotals;

  // opcional: rastro de estados
  statusHistory?: Array<{
    at: Date;
    from?: OrderStatus;
    to: OrderStatus;
    reason?: string;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

/** === Schemas === */

// ---- Financiación por ítem (snapshot + compat) ----
const OrderItemFinancingSchema = new Schema<OrderItemFinancingSnapshot>(
  {
    planRef: { type: Schema.Types.ObjectId, ref: "FinancingPlan", default: null },

    modeApplied: { type: String, enum: ["inherit", "override", "disabled"], required: true },
    groupKey: { type: String, default: null },

    planCode: { type: Number, default: null },
    months: { type: Number, default: null, min: 1 },
    surchargePct: { type: Number, default: null, min: 0 },
    downPct: { type: Number, default: null, min: 0, max: 1 },

    // Compat: permitir recibir/mostrar planIds como en el esquema simple
    planIds: [{ type: Schema.Types.ObjectId, ref: "FinancingPlan" }],

    surchargeAmount: { type: Number, default: null, min: 0 },
    totalWithSurcharge: { type: Number, default: null, min: 0 },
    installmentAmount: { type: Number, default: null, min: 0 },
  },
  { _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual de compat: financing.mode <-> modeApplied
OrderItemFinancingSchema.virtual("mode")
  .get(function (this: any) {
    return this.modeApplied;
  })
  .set(function (this: any, v: "inherit" | "override" | "disabled") {
    this.modeApplied = v;
  });

// ---- Ítem ----
const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productTitle: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, default: null },

    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },

    financing: { type: OrderItemFinancingSchema, default: undefined },

    subTotal: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtuales de compat en items:
// title  <-> productTitle
OrderItemSchema.virtual("title")
  .get(function (this: any) {
    return this.productTitle;
  })
  .set(function (this: any, v: string) {
    this.productTitle = v;
  });

// _id_product <-> productId
OrderItemSchema.virtual("_id_product")
  .get(function (this: any) {
    return this.productId;
  })
  .set(function (this: any, v: Types.ObjectId | string) {
    this.productId = v as any;
  });

// sales_price (unitario) <-> unitPrice
OrderItemSchema.virtual("sales_price")
  .get(function (this: any) {
    return this.unitPrice;
  })
  .set(function (this: any, v: number) {
    this.unitPrice = v;
  });

// ---- Totales ----
const OrderTotalsSchema = new Schema<OrderTotals>(
  {
    itemsSubTotal: { type: Number, required: true, min: 0 },
    surchargeTotal: { type: Number, required: true, min: 0 },
    discountTotal: { type: Number, required: true, min: 0, default: 0 },
    shippingTotal: { type: Number, required: true, min: 0, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// ---- Cliente ----
const OrderCustomerSchema = new Schema<OrderCustomer>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true }, 
    email: { type: String, default: null },
    docNumber: { type: String, default: null },
  },
  { _id: false }
);

// ---- Orden raíz ----
const OrderSchema = new Schema<OrderDocument>(
  {
    orderNumber: { type: String, index: true },

    status: { type: String, enum: ORDER_STATUSES, default: "en_proceso", index: true },

    customer: { type: OrderCustomerSchema, required: true },

    items: {
      type: [OrderItemSchema],
      validate: [(arr: OrderItem[]) => arr.length > 0, "La orden debe tener al menos 1 ítem."],
      required: true,
    },

    notes: { type: String, default: null },
    shipping: { type: String, default: null }, // compat

    currency: { type: String, enum: ["ARS", "USD"], default: "ARS" },

    totals: { type: OrderTotalsSchema, required: true },

    statusHistory: [
      {
        at: { type: Date, required: true, default: Date.now },
        from: { type: String, enum: ORDER_STATUSES, required: false },
        to: { type: String, enum: ORDER_STATUSES, required: true },
        reason: { type: String },
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/** === Virtuales de compat a nivel raíz === */

// client  <-> customer.name
OrderSchema.virtual("client")
  .get(function (this: any) {
    return this.customer?.name;
  })
  .set(function (this: any, v: string) {
    this.customer = this.customer || {};
    this.customer.name = v;
  });

// phone   <-> customer.phone
OrderSchema.virtual("phone")
  .get(function (this: any) {
    return this.customer?.phone;
  })
  .set(function (this: any, v: string) {
    this.customer = this.customer || {};
    this.customer.phone = v;
  });

// created_at -> createdAt (solo lectura común en payloads simples)
OrderSchema.virtual("created_at").get(function (this: any) {
  return this.createdAt;
});

/** === Índices útiles === */
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ "items.productId": 1 });
OrderSchema.index({ "customer.phone": 1, createdAt: -1 });
OrderSchema.index({ "customer.phone": 1, status: 1, createdAt: -1 });


export default models.Order || model<OrderDocument>("Order", OrderSchema, "orders");

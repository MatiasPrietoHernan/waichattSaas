// db/schemas/product.model.ts
import {
  Schema,
  model,
  models,
  type Model,
  type InferSchemaType,
  type HydratedDocument,
  type Types,
} from "mongoose";

/* ============ Colección (alineala con la que usás con el driver nativo) ============ */
// ⚠️ Corregí el nombre del env var si está mal tipeado.
// En tu API usás process.env.DATABSE_COLECCTION_PROD (parece con typos).
const COLLECTION =
  process.env.DATABASE_COLLECTION_PROD /* recomendado */ ??
  process.env.DATABSE_COLECCTION_PROD /* tu var actual */ ??
  "products";

/* ============ Subschema: Financing (tipo crudo) ============ */
type FinancingMode = "inherit" | "override" | "disabled";

interface ProductFinancingRaw {
  mode: FinancingMode;
  planIds?: Types.ObjectId[];   // planes habilitados por _id
  groupKey?: string;
  downPct?: number | null;      // 0.15 = 15%
  includeCodes?: number[];      // alternativa por códigos (3,6,12)
}

const ProductFinancingSchema = new Schema<ProductFinancingRaw>(
  {
    mode: { type: String, enum: ["inherit", "override", "disabled"], default: "inherit" },
    planIds: [{ type: Schema.Types.ObjectId, ref: "FinancingPlan" }],
    groupKey: { type: String, default: "default" },
    downPct: { type: Number, min: 0, max: 1, default: null },
    includeCodes: { type: [Number], default: [] },
  },
  { _id: false }
);

/* ============ Schema Producto (tipo crudo) ============ */
const ProductSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    price: { type: Number, required: true, min: 0 },
    sales_price: { type: Number, min: 0 },

    category: { type: String, required: true, trim: true },
    subcategory: { type: String, default: "", trim: true },

    is_deleted: { type: Boolean, default: false },
    image_urls: { type: [String], default: [] },

    stock: { type: Number, required: true, min: 0 },

    financing: {
      type: ProductFinancingSchema,
      default: () => ({
        mode: "inherit",
        groupKey: "default",
        downPct: null,
        planIds: [],
        includeCodes: [],
      }),
    },
  },
  { timestamps: true }
);

/* ============ Índices ============ */
ProductSchema.index({ is_deleted: 1 });
ProductSchema.index({ category: 1, subcategory: 1 });
// ProductSchema.index({ title: "text" }); // opcional

/* ============ Tipos derivados y modelo ============ */
export type Product = InferSchemaType<typeof ProductSchema>;   // tipo crudo
export type ProductDocument = HydratedDocument<Product>;       // doc hidratado
export type ProductModel = Model<Product>;                     // modelo

const ProductModel =
  (models.Product as ProductModel) || model<Product>("Product", ProductSchema, COLLECTION);

export default ProductModel;
export { ProductSchema, ProductFinancingSchema };

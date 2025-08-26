// types/product.ts
export type FinancingMode = "inherit" | "override" | "disabled";

type ProductFinancing = {
  mode: "inherit" | "override" | "disabled";
  groupKey?: string | null;
  downPct?: number | null;
  planIds?: string[]; // ← En lugar de codes?: number[]
}

export interface IProduct {
  _id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  sales_price: number;
  price: number | null;
  stock: number;
  image: string;
  image_urls?: string[];
  is_deleted: boolean;

  // nuevo
  financing?: ProductFinancing;
}

// types/ICheckoutform.ts
export interface FinancingConfig {
  mode: "inherit" | "override" | "disabled";
  groupKey?: string | null;
  downPct?: number | null;
  planIds?: string[];
}

export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  financing?: FinancingConfig; // 👈 clave
}

export interface CheckoutFormProps {
  items: CheckoutItem[];
  totalPrice: number;
  onBack: () => void;
  onClose: () => void;
}

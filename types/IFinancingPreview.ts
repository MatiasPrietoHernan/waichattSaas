export type QuoteItem = {
  code?: number;
  description: string;
  months: number;
  surchargePct: number;    // 0.30 = 30%
  monthly: number;
  total: number;
  downAmount: number;
  downPct: number | null;
};

export type QuoteResponse = {
  price: number;
  downPct: number;
  items: QuoteItem[];
};

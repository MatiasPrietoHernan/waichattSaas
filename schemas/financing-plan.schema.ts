import { Schema, models, model } from "mongoose";
import type { FinancingPlan } from "@/types/IFinancing";

const FinancingPlanSchema = new Schema<FinancingPlan>({
  code: { type: Number, index: true },
  description: { type: String, required: true },
  months: { type: Number, required: true, min: 1 },
  surchargePct: { type: Number, required: true, min: 0 },

  
  groupKey: { type: String, index: true, default: "default" },

  active: { type: Boolean, default: true },
  minPrice: { type: Number, default: null },
  maxPrice: { type: Number, default: null },
  includeCategories: { type: [String], default: [] },
  excludeCategories: { type: [String], default: [] },
}, { timestamps: true });

export default models.FinancingPlan ||
  model<FinancingPlan>("FinancingPlan", FinancingPlanSchema, "financing_plans");

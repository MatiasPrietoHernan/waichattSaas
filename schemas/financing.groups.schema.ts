// schemas/financing-group.schema.ts
import { Schema, models, model } from "mongoose";
import type { FinancingGroup } from "@/types/IFinancing";

const FinancingGroupSchema = new Schema<FinancingGroup>({
  key: { type: String, required: true, unique: true, index: true }, // slug
  name: { type: String, required: true },
  description: { type: String },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default models.FinancingGroup ||
  model<FinancingGroup>("FinancingGroup", FinancingGroupSchema, "financing_groups");

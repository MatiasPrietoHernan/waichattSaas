export type FinancingMode = "inherit" | "override" | "disabled"

export type Plan = {
  _id: string
  description: string
  months: number
  surchargePct: number
  active: boolean
  group?: string
}
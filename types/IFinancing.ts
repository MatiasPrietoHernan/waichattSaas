// types/financing.ts
export interface FinancingGroup {
  _id?: string
  key: string        
  name: string       
  description?: string
  order?: number
  active: boolean
}

export interface FinancingPlan {
  _id?: string
  code?: number
  description: string
  months: number
  surchargePct: number
  groupKey?: string | null     
  active: boolean


  minPrice?: number | null
  maxPrice?: number | null
  includeCategories?: string[]
  excludeCategories?: string[]
}

export interface CreditProvider {
  _id?: string
  name: string
  monthlyRatePct: number
  monthsOptions: number[]
  originationPct?: number
  minDownPct?: number
  active: boolean
  notes?: string
}

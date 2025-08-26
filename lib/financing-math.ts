export type PublicPlan = {
  _id: string
  description: string
  months: number
  surchargePct: number   // 0.30 = 30%, 1 = 100%
  groupKey?: string | null
  active: boolean
}

export function computeFinancingRows(
  price: number,
  downPct: number,
  plans: PublicPlan[]
) {
  const down = Math.max(0, price * downPct)
  const saldo = Math.max(0, price - down)

  return plans
    .filter(p => p.active && p.months > 0)
    .map(p => {
      const total = saldo * (1 + p.surchargePct)
      const installment = total / p.months
      return { ...p, down, saldo, total, installment }
    })
    .sort((a,b) => a.months - b.months)
}

export function fmtMoney(n: number, locale = "es-AR", currency = "ARS") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(n)
  } catch { // si no hay Intl con ARS, usar número común
    return n.toLocaleString(locale, { maximumFractionDigits: 2 })
  }
}

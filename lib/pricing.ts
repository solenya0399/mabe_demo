import type { PricingPolicy } from "@/types/pricing"
import type { Session } from "@/types/session"
import type { EnergyPolicy } from "@/types/energy"

export function priceAt(policy: PricingPolicy | undefined, date: Date): number {
  if (!policy) return 3.5
  const hour = date.getHours()
  const block = policy.tou.find((b) => hour >= b.startHour && hour < b.endHour)
  return block?.price ?? policy.tou[0]?.price ?? 3.5
}

export function estimateSessionCost({
  session,
  pricing,
  energyPolicy,
}: {
  session: Session
  pricing?: PricingPolicy
  energyPolicy?: EnergyPolicy
}) {
  // Precio base: simplificado al precio al inicio de sesión.
  const start = new Date(session.startAt)
  const basePrice = priceAt(pricing, start)
  const energyCost = (session.kwh || 0) * basePrice

  // Cargos por idle tras la gracia
  const grace = energyPolicy?.graceMinutes ?? 10
  const extraIdle = Math.max(0, (session.idleMinutes ?? 0) - grace)
  const idleFee = (pricing?.idleFeePerMinute ?? 0) * extraIdle

  return {
    energyCost,
    idleFee,
    total: energyCost + idleFee,
  }
}

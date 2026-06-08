export function formatCountdown(ms: number): string {
  if (ms <= 0) return "Coup d'envoi"
  const totalMin = Math.floor(ms / 60000)
  const d = Math.floor(totalMin / (60 * 24))
  const h = Math.floor((totalMin % (60 * 24)) / 60)
  const m = totalMin % 60
  return `${d}j ${h}h ${m}m`
}

/** Clé de date (YYYY-MM-DD) dans le fuseau de Paris, comparable comme chaîne. */
export function parisDateKey(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' })
}

/**
 * Verrou à la journée : un match est verrouillé dès que son jour (heure de Paris)
 * est arrivé. Autrement dit, il faut parier la veille au plus tard.
 */
export function isLocked(kickoffIso: string, now: Date = new Date()): boolean {
  return parisDateKey(new Date(kickoffIso)) <= parisDateKey(now)
}

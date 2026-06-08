export function isLocked(kickoffIso: string, now: Date = new Date()): boolean {
  return new Date(kickoffIso).getTime() <= now.getTime()
}

// Cagnotte : modèle plat, 10€ par joueur, 100% redistribué.
// Le nombre de gagnants croît avec le nombre de participants.
export const ENTRY_FEE = 10 // euros par joueur

// Parts (fractions, somme = 1) selon le nombre de gagnants.
const SPLITS: Record<number, number[]> = {
  1: [1],
  2: [0.6, 0.4],
  3: [0.5, 0.3, 0.2],
  4: [0.4, 0.28, 0.2, 0.12],
  5: [0.35, 0.25, 0.18, 0.13, 0.09],
}

// Paliers : nombre de gagnants selon le nombre de participants.
export const PRIZE_TIERS = [
  { min: 2, max: 7, winners: 2 },
  { min: 8, max: 14, winners: 3 },
  { min: 15, max: 23, winners: 4 },
  { min: 24, max: Infinity, winners: 5 },
] as const

/** Nombre de gagnants pour un nombre de joueurs donné. */
export function winnersCount(players: number): number {
  if (players <= 1) return Math.max(0, players)
  return PRIZE_TIERS.find((t) => players >= t.min && players <= t.max)?.winners ?? 1
}

/** Cagnotte totale (€). */
export function potFor(players: number): number {
  return players * ENTRY_FEE
}

/** Parts (fractions) attribuées, du 1er au dernier gagnant. */
export function prizeShares(players: number): number[] {
  return SPLITS[winnersCount(players)] ?? []
}

/** Gain (€) du joueur classé à `rankIndex` (0 = 1er) pour un nombre de joueurs donné. */
export function prizeFor(rankIndex: number, players: number): number {
  const share = prizeShares(players)[rankIndex] ?? 0
  return Math.round(share * potFor(players))
}

export function formatEuro(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

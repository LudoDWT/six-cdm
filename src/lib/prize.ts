// Montant d'une contribution unitaire à la cagnotte.
export const CONTRIB_STEP = 10 // euros

// Répartition de la cagnotte entre les 3 premiers CONTRIBUTEURS.
// Ajuste simplement ces parts pour changer la règle.
export const PRIZE_SPLIT = [0.5, 0.35, 0.15] as const // 1er, 2e, 3e

/** Gain (€) du contributeur à l'index de rang donné (0 = 1er), pour un pot donné. */
export function prizeFor(rankIndex: number, pot: number): number {
  const share = PRIZE_SPLIT[rankIndex] ?? 0
  return Math.round(share * pot)
}

export function formatEuro(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

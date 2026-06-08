export interface Score {
  h: number
  a: number
}

export function computePoints(pred: Score, result: Score | null): number | null {
  if (!result) return null
  if (pred.h === result.h && pred.a === result.a) return 3
  if (Math.sign(pred.h - pred.a) === Math.sign(result.h - result.a)) return 1
  return 0
}

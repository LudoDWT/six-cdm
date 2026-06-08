import type { Stage } from '@/types/match'

/** Libellés de phase cohérents, partagés par toute l'app. */
const STAGE_LABELS: Record<Stage, string> = {
  group: 'Phase de groupes',
  round_of_32: '16es de finale',
  round_of_16: '8es de finale',
  quarter: 'Quart de finale',
  semi: 'Demi-finale',
  third_place: 'Petite finale',
  final: 'Finale',
}

/** Libellé long d'une phase (ex. round_of_16 → "8es de finale"). */
export function stageLabel(stage: Stage | string): string {
  return STAGE_LABELS[stage as Stage] ?? stage
}

/**
 * Libellé contextuel pour un match : "Groupe A" en phase de groupes,
 * sinon le libellé de phase.
 */
export function matchStageLabel(stage: Stage | string, groupName?: string | null): string {
  if (stage === 'group' && groupName) return `Groupe ${groupName}`
  return stageLabel(stage)
}

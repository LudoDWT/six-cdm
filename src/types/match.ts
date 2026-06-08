export type Stage =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter'
  | 'semi'
  | 'third_place'
  | 'final'

export interface MatchSeed {
  id: number // numéro de match FIFA (1..104)
  stage: Stage
  group_name: string | null // A..L en phase de groupes, null en phase finale
  home_team: string
  away_team: string
  kickoff_at: string // ISO 8601 UTC
  venue: string
}

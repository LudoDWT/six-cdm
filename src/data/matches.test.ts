import { describe, it, expect } from 'vitest'
import matches from './matches.json'
import type { MatchSeed } from '@/types/match'

const data = matches as MatchSeed[]

describe('matches.json', () => {
  it('contient 104 matchs', () => {
    expect(data.length).toBe(104)
  })

  it('a des ids uniques couvrant 1..104', () => {
    const ids = new Set(data.map((m) => m.id))
    expect(ids.size).toBe(104)
    expect(Math.min(...ids)).toBe(1)
    expect(Math.max(...ids)).toBe(104)
  })

  it('a des kickoff_at ISO valides', () => {
    for (const m of data) {
      expect(Number.isNaN(Date.parse(m.kickoff_at))).toBe(false)
    }
  })

  it('couvre la fenêtre du tournoi (11 juin -> 19 juillet 2026)', () => {
    const times = data.map((m) => Date.parse(m.kickoff_at)).sort((a, b) => a - b)
    expect(new Date(times[0]).toISOString()).toBe('2026-06-11T19:00:00.000Z')
    expect(new Date(times[times.length - 1]).toISOString()).toBe(
      '2026-07-19T19:00:00.000Z',
    )
  })

  it('a 12 groupes (A..L) avec 6 matchs et 4 équipes chacun', () => {
    const groupMatches = data.filter((m) => m.stage === 'group')
    expect(groupMatches.length).toBe(72)
    const byGroup = new Map<string, MatchSeed[]>()
    for (const m of groupMatches) {
      const g = m.group_name as string
      byGroup.set(g, [...(byGroup.get(g) ?? []), m])
    }
    expect([...byGroup.keys()].sort()).toEqual(
      'A B C D E F G H I J K L'.split(' '),
    )
    for (const [, ms] of byGroup) {
      expect(ms.length).toBe(6)
      const teams = new Set(ms.flatMap((m) => [m.home_team, m.away_team]))
      expect(teams.size).toBe(4)
    }
  })

  it('a le bon nombre de matchs par phase finale', () => {
    const count = (s: string) => data.filter((m) => m.stage === s).length
    expect(count('round_of_32')).toBe(16)
    expect(count('round_of_16')).toBe(8)
    expect(count('quarter')).toBe(4)
    expect(count('semi')).toBe(2)
    expect(count('third_place')).toBe(1)
    expect(count('final')).toBe(1)
  })

  it('renseigne venue et group_name=null en phase finale', () => {
    for (const m of data) {
      expect(m.venue.length).toBeGreaterThan(0)
      if (m.stage !== 'group') expect(m.group_name).toBeNull()
    }
  })
})

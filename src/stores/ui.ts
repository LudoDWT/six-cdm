import { create } from 'zustand'
import type { Stage } from '@/types/match'

interface UIState {
  stageFilter: Stage | 'all'
  groupFilter: string | 'all'
  setStageFilter: (s: Stage | 'all') => void
  setGroupFilter: (g: string | 'all') => void
}

export const useUIStore = create<UIState>((set) => ({
  stageFilter: 'all',
  groupFilter: 'all',
  setStageFilter: (stageFilter) => set({ stageFilter }),
  setGroupFilter: (groupFilter) => set({ groupFilter }),
}))

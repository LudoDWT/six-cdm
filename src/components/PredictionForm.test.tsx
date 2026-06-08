import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PredictionForm } from './PredictionForm'

describe('PredictionForm', () => {
  it('désactive les champs si le match a commencé', () => {
    render(
      <PredictionForm kickoffIso="2020-01-01T00:00:00Z" homeTeam="A" awayTeam="B" onSubmit={() => {}} />,
    )
    expect(screen.getByLabelText('Score A')).toBeDisabled()
  })
  it('active les champs si le match est à venir', () => {
    render(
      <PredictionForm kickoffIso="2030-01-01T00:00:00Z" homeTeam="A" awayTeam="B" onSubmit={() => {}} />,
    )
    expect(screen.getByLabelText('Score A')).not.toBeDisabled()
  })
})

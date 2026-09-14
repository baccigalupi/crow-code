import { describe, it, expect } from 'vitest'
import {
  benchmarkAgentic,
  benchmarkIntelligence,
  resolveCoding,
} from '../../../src/model-discovery/ratings/record-scores'

describe('recordScores', () => {
  it('when the AA benchmark has a coding score, uses it with source AA', () => {
    const result = resolveCoding(
      { intelligence: 40, coding: 60, agentic: 30 },
      undefined,
    )

    expect(result).toEqual({ coding: 60, source: 'AA' })
  })

  it('when the benchmark is missing, falls back to the Aider score', () => {
    const result = resolveCoding(undefined, 88)

    expect(result).toEqual({ coding: 88, source: 'Aider' })
  })

  it('when neither source is available, returns null', () => {
    const result = resolveCoding(undefined, undefined)

    expect(result).toEqual({ coding: null, source: null })
  })

  it('when a benchmark is undefined, intelligence is null', () => {
    const result = benchmarkIntelligence(undefined)

    expect(result).toBeNull()
  })

  it('when a benchmark has intelligence, returns it', () => {
    const result = benchmarkIntelligence({
      intelligence: 40,
      coding: 60,
      agentic: 30,
    })

    expect(result).toBe(40)
  })

  it('when a benchmark is undefined, agentic is null', () => {
    const result = benchmarkAgentic(undefined)

    expect(result).toBeNull()
  })

  it('when a benchmark has agentic, returns it', () => {
    const result = benchmarkAgentic({
      intelligence: 40,
      coding: 60,
      agentic: 30,
    })

    expect(result).toBe(30)
  })
})

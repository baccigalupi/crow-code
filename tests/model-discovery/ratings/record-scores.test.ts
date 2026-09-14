import { describe, it, expect } from 'vitest'
import {
  applyScores,
  benchmarkAgentic,
  benchmarkIntelligence,
  resolveCoding,
} from '../../../src/model-discovery/ratings/record-scores'
import { aiderPolyglotPct } from '../../../src/model-discovery/ratings/aider-polyglot'
import type {
  AABenchmarks,
  ModelRecord,
} from '../../../src/model-discovery/types'

describe('recordScores', () => {
  const record: ModelRecord = {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    providers: ['anthropic'],
    reasoning: null,
    coding: null,
    codingSource: null,
    agentic: null,
    costInput: 3,
    costOutput: 15,
    contextLength: 200000,
    modality: 'text',
    reasoningMode: 'disabled',
    knowledgeCutoff: '2025-08-01',
    size: 'large',
  }

  const benchmarks = {
    'anthropic/claude-sonnet-4': {
      intelligence: 80,
      coding: 65,
      agentic: 70,
    },
  }

  const emptyBenchmarks = {}

  describe('pure helpers', () => {
    const benchmark = {
      intelligence: 40,
      coding: 60,
      agentic: 30,
    } as AABenchmarks

    it('when the AA benchmark has a coding score, uses it with source AA', () => {
      const result = resolveCoding(benchmark, undefined)

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
      const result = benchmarkIntelligence(benchmark)

      expect(result).toBe(40)
    })

    it('when a benchmark is undefined, agentic is null', () => {
      const result = benchmarkAgentic(undefined)

      expect(result).toBeNull()
    })

    it('when a benchmark has agentic, returns it', () => {
      const result = benchmarkAgentic(benchmark)

      expect(result).toBe(30)
    })
  })

  describe('applyScores', () => {
    it('when a record has a matching benchmark, applies intelligence, coding, and agentic', () => {
      const result = applyScores([record], benchmarks)

      expect(result).toEqual([
        {
          ...record,
          reasoning: 80,
          coding: 65,
          codingSource: 'AA',
          agentic: 70,
        },
      ])
    })

    it('when a record has no matching benchmark, keeps all scores null', () => {
      const noMatchRecord: ModelRecord = {
        ...record,
        id: 'qwen/qwen2-72b',
      }

      const result = applyScores([noMatchRecord], emptyBenchmarks)

      expect(result).toEqual([
        {
          ...noMatchRecord,
          reasoning: null,
          coding: null,
          codingSource: null,
          agentic: null,
        },
      ])
    })

    it('when a record has a benchmark with no coding but an Aider entry, falls back to Aider', () => {
      const gpt5Record: ModelRecord = {
        ...record,
        id: 'openai/gpt-5',
      }

      const intelligenceOnlyBenchmarks = {
        'openai/gpt-5': {
          intelligence: 80,
          coding: 0,
          agentic: 70,
        },
      }

      const result = applyScores([gpt5Record], intelligenceOnlyBenchmarks)

      expect(result).toEqual([
        {
          ...gpt5Record,
          reasoning: 80,
          coding: aiderPolyglotPct['openai/gpt-5'],
          codingSource: 'Aider',
          agentic: 70,
        },
      ])
    })
  })
})

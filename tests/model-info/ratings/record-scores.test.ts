import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  applyScores,
  benchmarkAgentic,
  benchmarkIntelligence,
  resolveCoding,
} from '../../../src/model-info/ratings/record-scores.ts'
import type { AABenchmarks, ModelInfo } from '../../../src/model-info/types.ts'

describe('recordScores', () => {
  it('when the AA benchmark has a coding score, uses it with source AA', () => {
    const benchmark: AABenchmarks = {
      intelligence: 40,
      coding: 60,
      agentic: 30,
    }

    const result = resolveCoding(benchmark)

    expect(result).toEqual({ coding: 60, source: 'AA' })
  })

  it('when the benchmark is missing, returns null', () => {
    const result = resolveCoding(undefined)

    expect(result).toEqual({ coding: null, source: null })
  })

  it('when the benchmark has no coding score, returns null', () => {
    const benchmark: AABenchmarks = {
      intelligence: 40,
      coding: 0,
      agentic: 30,
    }

    const result = resolveCoding(benchmark)

    expect(result).toEqual({ coding: null, source: null })
  })

  it('when a benchmark is undefined, intelligence is null', () => {
    const result = benchmarkIntelligence(undefined)

    expect(result).toBeNull()
  })

  it('when a benchmark has intelligence, returns it', () => {
    const benchmark: AABenchmarks = {
      intelligence: 40,
      coding: 60,
      agentic: 30,
    }

    const result = benchmarkIntelligence(benchmark)

    expect(result).toBe(40)
  })

  it('when a benchmark is undefined, agentic is null', () => {
    const result = benchmarkAgentic(undefined)

    expect(result).toBeNull()
  })

  it('when a benchmark has agentic, returns it', () => {
    const benchmark: AABenchmarks = {
      intelligence: 40,
      coding: 60,
      agentic: 30,
    }

    const result = benchmarkAgentic(benchmark)

    expect(result).toBe(30)
  })

  it('when a record has a matching benchmark, applies intelligence, coding, and agentic', () => {
    const record: ModelInfo = {
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
    const record: ModelInfo = {
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
    const noMatchRecord: ModelInfo = {
      ...record,
      id: 'qwen/qwen2-72b',
    }
    const emptyBenchmarks = {}

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
})

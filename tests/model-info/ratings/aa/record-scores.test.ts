import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  applyScores,
  benchmarkAgentic,
  benchmarkCoding,
  benchmarkIntelligence,
} from '../../../../src/model-info/ratings/aa/record-scores.ts'
import type {
  AABenchmarks,
  ModelInfo,
} from '../../../../src/model-info/types.ts'

describe('recordScores', () => {
  it('when the AA benchmark has a coding score, returns it', () => {
    const benchmark: AABenchmarks = {
      intelligence: 40,
      coding: 60,
      agentic: 30,
      reasoning: null,
    }

    const result = benchmarkCoding(benchmark)

    expect(result).toBe(60)
  })

  it('when the benchmark is missing, coding is null', () => {
    const result = benchmarkCoding(undefined)

    expect(result).toBeNull()
  })

  it('when the benchmark has no coding score, coding is null', () => {
    const benchmark: AABenchmarks = {
      intelligence: 40,
      coding: 0,
      agentic: 30,
      reasoning: null,
    }

    const result = benchmarkCoding(benchmark)

    expect(result).toBeNull()
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
      reasoning: null,
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
      reasoning: null,
    }

    const result = benchmarkAgentic(benchmark)

    expect(result).toBe(30)
  })

  it('when a record has a matching benchmark, applies intelligence, coding, and agentic', () => {
    const record: ModelInfo = {
      id: 'anthropic/claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'anthropic',
      reasoning: null,
      reasoningControls: [],
      intelligence: null,
      coding: null,
      agentic: null,
      costInput: 3,
      costOutput: 15,
      contextLength: 200000,
      modality: 'text',
      knowledgeCutoff: '2025-08-01',
      size: 'large',
    }
    const benchmarks = {
      'anthropic/claude-sonnet-4': {
        intelligence: 80,
        coding: 65,
        agentic: 70,
        reasoning: null,
      },
    }

    const result = applyScores([record], benchmarks)

    expect(result).toEqual([
      {
        ...record,
        intelligence: 80,
        coding: 65,
        agentic: 70,
      },
    ])
  })

  it('when reasoning is still null and AA flags a reasoning model, applies the flag', () => {
    const record: ModelInfo = {
      id: 'anthropic/claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'anthropic',
      reasoning: null,
      reasoningControls: [],
      intelligence: null,
      coding: null,
      agentic: null,
      costInput: 3,
      costOutput: 15,
      contextLength: 200000,
      modality: 'text',
      knowledgeCutoff: '2025-08-01',
      size: 'large',
    }
    const benchmarks = {
      'anthropic/claude-sonnet-4': {
        intelligence: 80,
        coding: 65,
        agentic: 70,
        reasoning: true,
      },
    }

    const result = applyScores([record], benchmarks)

    expect(result[0].reasoning).toBe(true)
  })

  it('when reasoning is already known, ignores the AA flag', () => {
    const record: ModelInfo = {
      id: 'anthropic/claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'anthropic',
      reasoning: false,
      reasoningControls: ['toggle'],
      intelligence: null,
      coding: null,
      agentic: null,
      costInput: 3,
      costOutput: 15,
      contextLength: 200000,
      modality: 'text',
      knowledgeCutoff: '2025-08-01',
      size: 'large',
    }
    const benchmarks = {
      'anthropic/claude-sonnet-4': {
        intelligence: 80,
        coding: 65,
        agentic: 70,
        reasoning: true,
      },
    }

    const result = applyScores([record], benchmarks)

    expect(result[0].reasoning).toBe(false)
    expect(result[0].reasoningControls).toEqual(['toggle'])
  })

  it('when a record has no matching benchmark, keeps all scores null', () => {
    const record: ModelInfo = {
      id: 'anthropic/claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'anthropic',
      reasoning: null,
      reasoningControls: [],
      intelligence: null,
      coding: null,
      agentic: null,
      costInput: 3,
      costOutput: 15,
      contextLength: 200000,
      modality: 'text',
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
        intelligence: null,
        coding: null,
        agentic: null,
      },
    ])
  })
})

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { applyScores } from '../../../../src/model-info/ratings/aa/record-scores.ts'
import type { ModelInfo } from '../../../../src/model-info/types.ts'

describe('applyScores', () => {
  it('when a record has a matching benchmark, applies intelligence, coding, and agentic', () => {
    const record: ModelInfo = {
      id: 'anthropic/claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'anthropic',
      reasoning: null,
      reasoningOptions: [],
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

  it('when benchmark scores are zero, applies null scores', () => {
    const record: ModelInfo = {
      id: 'anthropic/claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'anthropic',
      reasoning: null,
      reasoningOptions: [],
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
        intelligence: 0,
        coding: 0,
        agentic: 0,
        reasoning: null,
      },
    }

    const result = applyScores([record], benchmarks)

    expect(result[0].intelligence).toBeNull()
    expect(result[0].coding).toBeNull()
    expect(result[0].agentic).toBeNull()
  })

  it('when reasoning is still null and AA flags a reasoning model, applies the flag', () => {
    const record: ModelInfo = {
      id: 'anthropic/claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'anthropic',
      reasoning: null,
      reasoningOptions: [],
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
      reasoningOptions: ['toggle'],
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
    expect(result[0].reasoningOptions).toEqual(['toggle'])
  })

  it('when a record has no matching benchmark, keeps all scores null', () => {
    const record: ModelInfo = {
      id: 'anthropic/claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'anthropic',
      reasoning: null,
      reasoningOptions: [],
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

import { describe, it, expect } from 'vitest'
import { buildRecords } from '../../src/model-discovery/build-records'
import { AABenchmarks, ModelRecord } from '../../src/model-discovery/types'

const baseRecord: ModelRecord = {
  id: 'deepseek/deepseek-chat',
  name: 'DeepSeek Chat',
  providers: ['nous'],
  reasoning: null,
  coding: null,
  codingSource: null,
  agentic: null,
  costInput: 0.5,
  costOutput: 1.5,
  contextLength: 1000,
  modality: 'text->text',
  reasoningMode: 'off',
  knowledgeCutoff: null,
  size: '',
}

describe('buildRecords', () => {
  it('when a record has an AA benchmark, applies its indices', () => {
    const benchmarks: Record<string, AABenchmarks> = {
      'deepseek/deepseek-chat': { intelligence: 40, coding: 60, agentic: 30 },
    }

    const result = buildRecords([baseRecord], [], benchmarks)

    expect(result[0].reasoning).toBe(40)
    expect(result[0].coding).toBe(60)
    expect(result[0].codingSource).toBe('AA')
    expect(result[0].agentic).toBe(30)
  })

  it('when a record has no benchmark, falls back to the Aider score', () => {
    const record = { ...baseRecord, id: 'openai/gpt-5' }

    const result = buildRecords([record], [], {})

    expect(result[0].coding).toBe(88)
    expect(result[0].codingSource).toBe('Aider')
  })

  it('when the AA coding score is zero, falls back to the Aider score', () => {
    const record = { ...baseRecord, id: 'openai/gpt-5' }
    const benchmarks: Record<string, AABenchmarks> = {
      'openai/gpt-5': { intelligence: 30, coding: 0, agentic: 20 },
    }

    const result = buildRecords([record], [], benchmarks)

    expect(result[0].coding).toBe(88)
    expect(result[0].codingSource).toBe('Aider')
  })

  it('when a record has neither source, leaves coding null', () => {
    const record = { ...baseRecord, id: 'some/unknown-model' }

    const result = buildRecords([record], [], {})

    expect(result[0].coding).toBeNull()
    expect(result[0].codingSource).toBeNull()
  })

  it('when a record id starts with ~, skips it', () => {
    const record = { ...baseRecord, id: '~experimental' }

    const result = buildRecords([record], [], {})

    expect(result).toEqual([])
  })

  it('when a record id starts with openrouter/, skips it', () => {
    const record = { ...baseRecord, id: 'openrouter/foo' }

    const result = buildRecords([record], [], {})

    expect(result).toEqual([])
  })

  it('when a record is an embedding model, skips it', () => {
    const record = { ...baseRecord, id: 'openai/text-embedding-3-large' }

    const result = buildRecords([record], [], {})

    expect(result).toEqual([])
  })

  it('when an Ollama record is present, keeps its fields', () => {
    const ollama: ModelRecord = {
      ...baseRecord,
      id: 'qwen3-coder:30b',
      providers: ['ollama'],
      size: '30B',
    }

    const result = buildRecords([], [ollama], {})

    expect(result[0].providers).toEqual(['ollama'])
    expect(result[0].size).toBe('30B')
    expect(result[0].coding).toBeNull()
  })
})

import { describe, it, expect } from 'vitest'
import { buildRecords } from '../../src/model-discovery/build-records'
import {
  AABenchmarks,
  NousModel,
  OllamaModel,
} from '../../src/model-discovery/types'

describe('buildRecords', () => {
  it('when a Nous model has an AA benchmark, records the AA indices', () => {
    const models: NousModel[] = [{ id: 'deepseek/deepseek-chat' }]
    const benchmarks: Record<string, AABenchmarks> = {
      'deepseek/deepseek-chat': { intelligence: 70, coding: 60, agentic: 50 },
    }

    const result = buildRecords(models, [], benchmarks)

    expect(result).toHaveLength(1)
    expect(result[0].reasoning).toBe(70)
    expect(result[0].coding).toBe(60)
    expect(result[0].codingSource).toBe('AA')
    expect(result[0].agentic).toBe(50)
  })

  it('when a Nous model has no benchmark, falls back to the Aider score', () => {
    const models: NousModel[] = [{ id: 'openai/gpt-5' }]

    const result = buildRecords(models, [], {})

    expect(result[0].coding).toBe(88)
    expect(result[0].codingSource).toBe('Aider')
  })

  it('when a model has neither source, leaves coding null', () => {
    const models: NousModel[] = [{ id: 'some/unknown-model' }]

    const result = buildRecords(models, [], {})

    expect(result[0].coding).toBeNull()
    expect(result[0].codingSource).toBeNull()
  })

  it('when a model id starts with ~, skips it', () => {
    const models: NousModel[] = [{ id: '~experimental' }]

    const result = buildRecords(models, [], {})

    expect(result).toEqual([])
  })

  it('when a model is an embedding model, skips it', () => {
    const models: NousModel[] = [{ id: 'openai/text-embedding-3-large' }]

    const result = buildRecords(models, [], {})

    expect(result).toEqual([])
  })

  it('when pricing is present, converts to dollars per million tokens', () => {
    const models: NousModel[] = [
      { id: 'x', pricing: { prompt: '0.0000005', completion: '0.0000015' } },
    ]

    const result = buildRecords(models, [], {})

    expect(result[0].costInput).toBe(0.5)
    expect(result[0].costOutput).toBe(1.5)
  })

  it('when an Ollama model is present, records it as local', () => {
    const ollama: OllamaModel[] = [
      {
        name: 'qwen3-coder:30b',
        details: { parameter_size: '30B', context_length: 32768 },
      },
    ]

    const result = buildRecords([], ollama, {})

    expect(result[0].providers).toEqual(['ollama'])
    expect(result[0].size).toBe('30B')
    expect(result[0].contextLength).toBe(32768)
    expect(result[0].costInput).toBe(0)
  })
})

import { describe, it, expect } from 'vitest'
import { buildOllamaRecord } from '../../src/model-discovery/ollama-record'
import { OllamaModel } from '../../src/model-discovery/types'

describe('buildOllamaRecord', () => {
  it('when given an Ollama model, maps size and context', () => {
    const model: OllamaModel = {
      name: 'qwen3-coder:30b',
      details: { parameter_size: '30B', context_length: 32768 },
    }

    const result = buildOllamaRecord(model)

    expect(result.id).toBe('qwen3-coder:30b')
    expect(result.providers).toEqual(['ollama'])
    expect(result.size).toBe('30B')
    expect(result.contextLength).toBe(32768)
    expect(result.costInput).toBe(0)
    expect(result.costOutput).toBe(0)
    expect(result.modality).toBe('local')
  })

  it('when details are missing, size is empty and context is null', () => {
    const model: OllamaModel = { name: 'qwen3-coder:30b' }

    const result = buildOllamaRecord(model)

    expect(result.size).toBe('')
    expect(result.contextLength).toBeNull()
  })

  it('when there is no Aider score, coding is null', () => {
    const model: OllamaModel = { name: 'unknown-local-model' }

    const result = buildOllamaRecord(model)

    expect(result.coding).toBeNull()
    expect(result.codingSource).toBeNull()
  })
})

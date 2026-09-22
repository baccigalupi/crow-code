import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { OllamaParser } from '../../../../../src/model-info/catalog/providers/ollama/parser.ts'
import type { ProviderConfig } from '../../../../../src/model-info/types.ts'

const ollamaConfig: ProviderConfig = {
  name: 'ollama',
  baseUrl: 'http://pile-driver.local:11434',
  modelsUrl: 'http://pile-driver.local:11434/api/tags',
}

describe('OllamaParser', () => {
  it('when the body has no models key, returns an empty list', () => {
    const parser = new OllamaParser(ollamaConfig)

    const result = parser.parseResponse({})

    expect(result).toEqual([])
  })

  it('when the body has models, normalizes them into records', () => {
    const parser = new OllamaParser(ollamaConfig)
    const body = {
      models: [
        {
          name: 'qwen3-coder:30b',
          details: { parameter_size: '30B', context_length: 32768 },
        },
      ],
    }

    const result = parser.parseResponse(body)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('qwen3-coder:30b')
    expect(result[0].provider).toBe('ollama')
    expect(result[0].size).toBe('30B')
    expect(result[0].contextLength).toBe(32768)
    expect(result[0].costInput).toBe(0)
    expect(result[0].modality).toBe('local')
  })

  it('when details are missing, size is empty and context is null', () => {
    const parser = new OllamaParser(ollamaConfig)

    const result = parser.parseResponse({
      models: [{ name: 'qwen3-coder:30b' }],
    })

    expect(result[0].size).toBe('')
    expect(result[0].contextLength).toBeNull()
  })

  it('when details have context_length of zero, context is null', () => {
    const parser = new OllamaParser(ollamaConfig)

    const result = parser.parseResponse({
      models: [{ name: 'x', details: { context_length: 0 } }],
    })

    expect(result[0].contextLength).toBeNull()
  })
})

import { describe, it, expect } from 'vitest'
import { parseOllamaResponse } from '../../../src/model-discovery/providers/ollama'

describe('ollama', () => {
  it('when the body has no models key, returns an empty list', () => {
    const result = parseOllamaResponse({})

    expect(result).toEqual([])
  })

  it('when the body has models, normalizes them into records', () => {
    const body = {
      models: [
        {
          name: 'qwen3-coder:30b',
          details: { parameter_size: '30B', context_length: 32768 },
        },
      ],
    }

    const result = parseOllamaResponse(body)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('qwen3-coder:30b')
    expect(result[0].providers).toEqual(['ollama'])
    expect(result[0].size).toBe('30B')
    expect(result[0].contextLength).toBe(32768)
    expect(result[0].costInput).toBe(0)
    expect(result[0].modality).toBe('local')
  })

  it('when details are missing, size is empty and context is null', () => {
    const result = parseOllamaResponse({
      models: [{ name: 'qwen3-coder:30b' }],
    })

    expect(result[0].size).toBe('')
    expect(result[0].contextLength).toBeNull()
  })
})

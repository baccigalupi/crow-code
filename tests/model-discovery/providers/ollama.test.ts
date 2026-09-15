import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  fetchOllamaModels,
  parseOllamaResponse,
} from '../../../src/model-discovery/providers/ollama.js'
import type { ProviderConfig } from '../../../src/model-discovery/types.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

const ollamaConfig: ProviderConfig = {
  name: 'ollama',
  baseUrl: 'http://pile-driver.local:11434',
  modelsUrl: 'http://pile-driver.local:11434/api/tags',
}

describe('ollama', () => {
  it('when the body has no models key, returns an empty list', () => {
    const result = parseOllamaResponse({}, ollamaConfig)

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

    const result = parseOllamaResponse(body, ollamaConfig)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('qwen3-coder:30b')
    expect(result[0].providers).toEqual(['ollama'])
    expect(result[0].size).toBe('30B')
    expect(result[0].contextLength).toBe(32768)
    expect(result[0].costInput).toBe(0)
    expect(result[0].modality).toBe('local')
  })

  it('when details are missing, size is empty and context is null', () => {
    const result = parseOllamaResponse(
      {
        models: [{ name: 'qwen3-coder:30b' }],
      },
      ollamaConfig,
    )

    expect(result[0].size).toBe('')
    expect(result[0].contextLength).toBeNull()
  })

  it('when details have context_length of zero, context is null', () => {
    const result = parseOllamaResponse(
      {
        models: [{ name: 'x', details: { context_length: 0 } }],
      },
      ollamaConfig,
    )

    expect(result[0].contextLength).toBeNull()
  })

  it('when fetched with modelsUrl omitted, falls back to baseUrl', async () => {
    const config: ProviderConfig = {
      name: 'ollama',
      baseUrl: 'http://pile-driver.local:11434',
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ models: [{ name: 'qwen3-coder:30b' }] }),
      }),
    )

    const result = await fetchOllamaModels(config)

    expect(result[0].id).toBe('qwen3-coder:30b')
  })

  it('when fetched, returns normalized records', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ models: [{ name: 'qwen3-coder:30b' }] }),
      }),
    )

    const result = await fetchOllamaModels(ollamaConfig)

    expect(result[0].id).toBe('qwen3-coder:30b')
    expect(result[0].providers).toEqual(['ollama'])
  })

  it('when the network request fails, returns an empty list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const result = await fetchOllamaModels(ollamaConfig)

    expect(result).toEqual([])
  })
})

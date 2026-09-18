import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  mockFetchRejected,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'
import {
  fetchOllamaModels,
  parseOllamaResponse,
} from '../../../src/model-discovery/providers/ollama.ts'
import type { ProviderConfig } from '../../../src/model-discovery/types.ts'

describe('ollama', () => {
  it('when the body has no models key, returns an empty list', () => {
    const ollamaConfig: ProviderConfig = {
      name: 'ollama',
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }

    const result = parseOllamaResponse({}, ollamaConfig)

    expect(result).toEqual([])
  })

  it('when the body has models, normalizes them into records', () => {
    const ollamaConfig: ProviderConfig = {
      name: 'ollama',
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }
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
    const ollamaConfig: ProviderConfig = {
      name: 'ollama',
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }

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
    const ollamaConfig: ProviderConfig = {
      name: 'ollama',
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }

    const result = parseOllamaResponse(
      {
        models: [{ name: 'x', details: { context_length: 0 } }],
      },
      ollamaConfig,
    )

    expect(result[0].contextLength).toBeNull()
  })

  it('when fetched with modelsUrl omitted, falls back to baseUrl', async () => {
    const ollamaConfig: ProviderConfig = {
      name: 'ollama',
      baseUrl: 'http://pile-driver.local:11434',
    }
    const mockFetch = mockFetchSuccess({
      models: [{ name: 'qwen3-coder:30b' }],
    })

    const result = await fetchOllamaModels(ollamaConfig, mockFetch)

    expect(result[0].id).toBe('qwen3-coder:30b')
  })

  it('when fetched, returns normalized records', async () => {
    const ollamaConfig: ProviderConfig = {
      name: 'ollama',
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }
    const mockFetch = mockFetchSuccess({
      models: [{ name: 'qwen3-coder:30b' }],
    })

    const result = await fetchOllamaModels(ollamaConfig, mockFetch)

    expect(result[0].id).toBe('qwen3-coder:30b')
    expect(result[0].providers).toEqual(['ollama'])
  })

  it('when the network request fails, returns an empty list', async () => {
    const ollamaConfig: ProviderConfig = {
      name: 'ollama',
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }
    const mockFetch = mockFetchRejected('network down')

    const result = await fetchOllamaModels(ollamaConfig, mockFetch)

    expect(result).toEqual([])
  })
})

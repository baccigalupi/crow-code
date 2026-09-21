import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  mockFetchRejected,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'
import {
  fetchOllamaModels,
  parseOllamaResponse,
} from '../../../src/model-info/providers/ollama.ts'

describe('ollama', () => {
  it('when the body has models, parseOllamaResponse normalizes them into records', () => {
    const ollamaConfig = {
      name: 'ollama' as const,
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }
    const body = {
      models: [{ name: 'qwen3-coder:30b' }],
    }

    const result = parseOllamaResponse(body, ollamaConfig)

    expect(result[0].id).toBe('qwen3-coder:30b')
    expect(result[0].provider).toBe('ollama')
  })

  it('when fetched, fetchOllamaModels returns normalized records', async () => {
    const ollamaConfig = {
      name: 'ollama' as const,
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess({
      models: [{ name: 'qwen3-coder:30b' }],
    })

    const result = await fetchOllamaModels(ollamaConfig, logger, mockFetch)

    expect(result[0].id).toBe('qwen3-coder:30b')
    expect(result[0].provider).toBe('ollama')
  })

  it('when fetched with modelsUrl omitted, falls back to baseUrl/api/tags', async () => {
    const configWithoutModelsUrl = {
      name: 'ollama' as const,
      baseUrl: 'http://pile-driver.local:11434',
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess({
      models: [{ name: 'qwen3-coder:30b' }],
    })

    const result = await fetchOllamaModels(
      configWithoutModelsUrl,
      logger,
      mockFetch,
    )

    expect(result[0].id).toBe('qwen3-coder:30b')
  })

  it('when the network request fails, fetchOllamaModels returns an empty list', async () => {
    const ollamaConfig = {
      name: 'ollama' as const,
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchRejected('network down')

    const result = await fetchOllamaModels(ollamaConfig, logger, mockFetch)

    expect(result).toEqual([])
  })
})

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../../../support/mock-fetch.ts'
import { loadOllamaFixture } from '../../../../support/fixtures.ts'
import { getOllamaModels } from '../../../../../src/model-info/catalog/providers/ollama2/get-ollama-models.ts'

describe('getOllamaModels', () => {
  it('when fetched, returns parsed records', async () => {
    const ollamaConfig = {
      name: 'ollama' as const,
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }
    const fixture = await loadOllamaFixture()
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess(fixture)

    const result = await getOllamaModels(ollamaConfig, logger, mockFetch)

    expect(result).toHaveLength(3)
    expect(result[0].id).toBe('qwen3-coder:30b')
    expect(result[0].provider).toBe('ollama')
  })

  it('when fetched, requests the configured modelsUrl', async () => {
    const ollamaConfig = {
      name: 'ollama' as const,
      baseUrl: 'http://example.com',
      modelsUrl: 'http://other.local:11434/api/tags',
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess({ models: [] })

    await getOllamaModels(ollamaConfig, logger, mockFetch)

    expect(mockFetch.calls).toHaveLength(1)
    expect(mockFetch.calls[0]).toBe('http://other.local:11434/api/tags')
  })

  it('when the response is not ok, returns an empty list', async () => {
    const ollamaConfig = {
      name: 'ollama' as const,
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchError(500)

    const result = await getOllamaModels(ollamaConfig, logger, mockFetch)

    expect(result).toEqual([])
  })

  it('when the network request fails, returns an empty list', async () => {
    const ollamaConfig = {
      name: 'ollama' as const,
      baseUrl: 'http://pile-driver.local:11434',
      modelsUrl: 'http://pile-driver.local:11434/api/tags',
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchRejected('network down')

    const result = await getOllamaModels(ollamaConfig, logger, mockFetch)

    expect(result).toEqual([])
  })
})

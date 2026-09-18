import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { mockFetchError, mockFetchSuccess } from '../../support/mock-fetch.ts'
import { fetchProviders } from '../../../src/model-info/providers/fetch-providers.ts'
import type { ProviderConfig } from '../../../src/model-info/types.ts'
import pino from 'pino'

describe('fetchProviders', () => {
  it('when the provider name is unknown, returns an empty list', async () => {
    const config: ProviderConfig = {
      name: 'unknown',
      baseUrl: 'http://example.com',
    }
    const logger = pino({ enabled: false })

    const result = await fetchProviders(config, logger)

    expect(result).toEqual([])
  })

  it('when the provider name is known, returns the fetcher result', async () => {
    const config: ProviderConfig = {
      name: 'nous',
      baseUrl: 'http://example.com',
    }
    const apiResponse = {
      data: [
        {
          id: 'test-model',
          name: 'test-model',
          context_length: 100,
          knowledge_cutoff: '2025-01-01',
          architecture: { modality: 'text' },
        },
      ],
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess(apiResponse)

    const result = await fetchProviders(config, logger, mockFetch)

    expect(result).toEqual([
      {
        id: 'test-model',
        name: 'test-model',
        providers: ['nous'],
        reasoning: null,
        coding: null,
        codingSource: null,
        agentic: null,
        costInput: 0,
        costOutput: 0,
        contextLength: 100,
        modality: 'text',
        reasoningMode: '-',
        knowledgeCutoff: '2025-01-01',
        size: '',
      },
    ])
  })

  it('when the provider name is known and the request fails, returns an empty list', async () => {
    const config: ProviderConfig = {
      name: 'nous',
      baseUrl: 'http://example.com',
    }

    const logger = pino({ enabled: false })
    const mockFetch = mockFetchError(500)

    const result = await fetchProviders(config, logger, mockFetch)

    expect(result).toEqual([])
  })
})

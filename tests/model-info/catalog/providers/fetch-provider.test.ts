import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../../support/mock-fetch.ts'
import { fetchProvider } from '../../../../src/model-info/catalog/providers/fetch-provider.ts'
import pino from 'pino'

describe('fetchProvider', () => {
  it('when the request succeeds, returns the parsed models', async () => {
    type ApiRecord = { items: string[] }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess<ApiRecord>({ items: ['a'] })

    const result = await fetchProvider<ApiRecord, string>(
      'http://example.com',
      (raw: ApiRecord): string[] => raw.items,
      1000,
      logger,
      mockFetch,
    )

    expect(result).toEqual(['a'])
  })

  it('when the response is an error, returns an empty list', async () => {
    type ApiRecord = { items?: string[] }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchError(500)

    const result = await fetchProvider<ApiRecord, string>(
      'http://example.com',
      (): string[] => [],
      1000,
      logger,
      mockFetch,
    )

    expect(result).toEqual([])
  })

  it('when the network request fails, returns an empty list', async () => {
    type ApiRecord = { items?: string[] }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchRejected('network down')

    const result = await fetchProvider<ApiRecord, string>(
      'http://example.com',
      (): string[] => [],
      1000,
      logger,
      mockFetch,
    )

    expect(result).toEqual([])
  })
})

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { spy } from '@std/testing/mock'
import pino from 'pino'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchResponse,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'
import { fetchProvider } from '../../../src/model-discovery/populate/fetch-provider.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('fetchProvider', () => {
  it('when the request succeeds, returns the parsed models', async () => {
    type ApiRecord = { items: string[] }
    const mockFetch = mockFetchSuccess<ApiRecord>({ items: ['a'] })
    const applicationData = mockApplicationData({ fetch: mockFetch })

    const result = (await fetchProvider<ApiRecord, string>(
      applicationData,
      'http://example.com',
      (raw: ApiRecord): string[] => raw.items,
      1000,
    ).run()).result()

    expect(result).toEqual(['a'])
  })

  it('when the response is an error, returns an empty list', async () => {
    type ApiRecord = { items?: string[] }
    const mockFetch = mockFetchError(500)
    const applicationData = mockApplicationData({ fetch: mockFetch })

    const result = (await fetchProvider<ApiRecord, string>(
      applicationData,
      'http://example.com',
      (): string[] => [],
      1000,
    ).run()).result()

    expect(result).toEqual([])
  })

  it('when the response is an error, logs the status and response body', async () => {
    type ApiRecord = { items?: string[] }
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')
    const mockFetch = mockFetchResponse(
      () => new Response('oops', { status: 500 }),
    )
    const applicationData = mockApplicationData({ fetch: mockFetch, logger })

    await fetchProvider<ApiRecord, string>(
      applicationData,
      'http://example.com',
      (): string[] => [],
      1000,
    ).run()

    const logged = loggerErrorSpy.calls[0].args[0] as string
    expect(logged).toContain('Catalog request failed with status 500:')
    expect(logged).toContain('http://example.com')
    expect(logged).toContain('oops')
  })

  it('when the network request fails, returns an empty list', async () => {
    type ApiRecord = { items?: string[] }
    const mockFetch = mockFetchRejected('network down')
    const applicationData = mockApplicationData({ fetch: mockFetch })

    const result = (await fetchProvider<ApiRecord, string>(
      applicationData,
      'http://example.com',
      (): string[] => [],
      1000,
    ).run()).result()

    expect(result).toEqual([])
  })

  it('when the network request fails, logs the underlying error', async () => {
    type ApiRecord = { items?: string[] }
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')
    const mockFetch = mockFetchRejected('network down')
    const applicationData = mockApplicationData({ fetch: mockFetch, logger })

    await fetchProvider<ApiRecord, string>(
      applicationData,
      'http://example.com',
      (): string[] => [],
      1000,
    ).run()

    const logged = loggerErrorSpy.calls[0].args[0] as string
    expect(logged).toContain('Catalog request failed: http://example.com')
    expect(logged).toContain('network down')
  })
})

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  mockFetchError,
  mockFetchRejected,
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
})

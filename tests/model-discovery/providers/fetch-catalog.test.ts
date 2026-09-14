import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchCatalog } from '../../../src/model-discovery/providers/fetch-catalog.js'

describe('fetchCatalog', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('when the request succeeds, returns the parsed models', async () => {
    type ApiRecord = { items: string[] }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ items: ['a'] }),
      }),
    )

    const result = await fetchCatalog<ApiRecord, string>(
      'http://example.com',
      (raw: ApiRecord): string[] => raw.items,
      1000,
    )

    expect(result).toEqual(['a'])
  })

  it('when the response is an error, returns an empty list', async () => {
    type ApiRecord = { items?: string[] }

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    )

    const result = await fetchCatalog<ApiRecord, string>(
      'http://example.com',
      (): string[] => [],
      1000,
    )

    expect(result).toEqual([])
  })

  it('when the network request fails, returns an empty list', async () => {
    type ApiRecord = { items?: string[] }

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const result = await fetchCatalog<ApiRecord, string>(
      'http://example.com',
      (): string[] => [],
      1000,
    )

    expect(result).toEqual([])
  })
})

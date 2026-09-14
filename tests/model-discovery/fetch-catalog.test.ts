import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchCatalog } from '../../src/model-discovery/fetch-catalog'

const parse = (raw: unknown): string[] => {
  const body = raw as { items?: string[] }
  if (body.items === undefined) {
    return []
  }
  return body.items
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchCatalog', () => {
  it('when the request succeeds, returns the parsed models', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ items: ['a'] }),
      }),
    )

    const result = await fetchCatalog('http://example.com', parse, 1000)

    expect(result).toEqual(['a'])
  })

  it('when the response is an error, returns an empty list', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    )

    const result = await fetchCatalog('http://example.com', parse, 1000)

    expect(result).toEqual([])
  })

  it('when the network request fails, returns an empty list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const result = await fetchCatalog('http://example.com', parse, 1000)

    expect(result).toEqual([])
  })
})

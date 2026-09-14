import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchNousModels } from '../../src/model-discovery/fetch-nous'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchNousModels', () => {
  it('when the API returns models, returns them', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: [{ id: 'deepseek/deepseek-chat' }] }),
      }),
    )

    const result = await fetchNousModels()

    expect(result).toEqual([{ id: 'deepseek/deepseek-chat' }])
  })

  it('when the API responds with an error, returns an empty list', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    )

    const result = await fetchNousModels()

    expect(result).toEqual([])
  })
})

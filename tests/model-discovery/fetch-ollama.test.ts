import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchOllamaModels } from '../../src/model-discovery/fetch-ollama'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchOllamaModels', () => {
  it('when the API returns models, returns them', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ models: [{ name: 'qwen3-coder:30b' }] }),
      }),
    )

    const result = await fetchOllamaModels()

    expect(result).toEqual([{ name: 'qwen3-coder:30b' }])
  })

  it('when the API responds with an error, returns an empty list', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    )

    const result = await fetchOllamaModels()

    expect(result).toEqual([])
  })
})

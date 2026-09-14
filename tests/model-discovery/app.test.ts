import { describe, it, expect, vi, afterEach } from 'vitest'
import { main } from '../../src/model-discovery/app'
import { writeCache } from '../../src/model-discovery/cache'

vi.mock('../../src/model-discovery/cache', () => ({
  defaultCachePath: () => '/tmp/crow-code-cache.json',
  writeCache: vi.fn(),
}))

afterEach(() => {
  delete process.env.AA_API_KEY
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('main', () => {
  it('when run, fetches and writes the cache', async () => {
    process.env.AA_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('pile-driver')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ models: [{ name: 'qwen3-coder:30b' }] }),
          })
        }
        if (url.includes('artificialanalysis')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ data: [], pagination: { has_more: false } }),
          })
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: [{ id: 'deepseek/deepseek-chat' }] }),
        })
      }),
    )
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    await main()

    expect(vi.mocked(writeCache)).toHaveBeenCalledWith(
      '/tmp/crow-code-cache.json',
      expect.any(Array),
    )
    expect(log).toHaveBeenCalledWith(
      'Fetching model data and building cache...',
    )
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Wrote '))
  })
})

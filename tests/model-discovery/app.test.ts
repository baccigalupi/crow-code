import { describe, it, expect, vi, afterEach } from 'vitest'
import { main } from '../../src/model-discovery/app'
import { readCache, writeCache } from '../../src/model-discovery/cache'
import { CacheFile, ModelRecord } from '../../src/model-discovery/types'

vi.mock('../../src/model-discovery/cache', () => ({
  defaultCachePath: () => '/tmp/crow-code-cache.json',
  readCache: vi.fn(),
  writeCache: vi.fn(),
}))

const model: ModelRecord = {
  id: 'deepseek/deepseek-chat',
  name: 'DeepSeek Chat',
  providers: ['nous'],
  reasoning: 40,
  coding: 60,
  codingSource: 'AA',
  agentic: 30,
  costInput: 0.5,
  costOutput: 1.5,
  contextLength: 1000,
  modality: 'text->text',
  reasoningMode: 'off',
  knowledgeCutoff: null,
  size: '',
}

const cache: CacheFile = {
  fetchedAt: '2026-01-01T00:00:00.000Z',
  sources: ['test'],
  models: [model],
}

afterEach(() => {
  delete process.env.AA_API_KEY
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('main', () => {
  it('when the cache exists, renders the table', async () => {
    vi.mocked(readCache).mockReturnValue(cache)
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    await main([])

    expect(log).toHaveBeenCalled()
    expect(vi.mocked(writeCache)).not.toHaveBeenCalled()
  })

  it('when --json is given, renders the raw JSON', async () => {
    vi.mocked(readCache).mockReturnValue(cache)
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    await main(['--json'])

    expect(log).toHaveBeenCalledWith(JSON.stringify([model], null, 2))
  })

  it('when the cache is missing, fetches and builds it', async () => {
    process.env.AA_API_KEY = 'test-key'
    vi.mocked(readCache).mockReturnValue(null)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('pile-driver')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ models: [] }),
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
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    await main([])

    expect(vi.mocked(writeCache)).toHaveBeenCalled()
    expect(log).toHaveBeenCalled()
    expect(error).toHaveBeenCalledWith(
      'Fetching model data and building cache...',
    )
  })

  it('when --refresh is given, rebuilds the cache even when one exists', async () => {
    process.env.AA_API_KEY = 'test-key'
    vi.mocked(readCache).mockReturnValue(cache)
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
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    await main(['--refresh'])

    expect(vi.mocked(writeCache)).toHaveBeenCalled()
    expect(error).toHaveBeenCalledWith(
      'Fetching model data and building cache...',
    )
  })

  it('when --all is given, skips limiting the rows', async () => {
    vi.mocked(readCache).mockReturnValue(cache)
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    await main(['--all'])

    expect(log).toHaveBeenCalled()
  })
})

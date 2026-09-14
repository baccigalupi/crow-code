import { describe, it, expect, vi, afterEach } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  fetchAABenchmarks,
  loadApiKey,
} from '../../../src/model-discovery/ratings/aa-benchmarks'

const tempDirs: string[] = []

afterEach(() => {
  delete process.env.AA_API_KEY
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  tempDirs.forEach((dir) => rmSync(dir, { recursive: true, force: true }))
  tempDirs.length = 0
})

describe('aa-benchmarks', () => {
  it('when the key is set in the environment, returns it', () => {
    process.env.AA_API_KEY = 'test-key'

    const result = loadApiKey()

    expect(result).toBe('test-key')
  })

  it('when the env file does not exist, returns null', () => {
    const missing = join(tmpdir(), 'crow-code-missing.env')

    const result = loadApiKey(missing)

    expect(result).toBeNull()
  })

  it('when the env file has no key line, returns null', () => {
    const dir = mkdtempSync(join(tmpdir(), 'crow-code-aa-'))
    tempDirs.push(dir)
    const envPath = join(dir, '.env')
    writeFileSync(envPath, 'SOME_OTHER_KEY=1')

    const result = loadApiKey(envPath)

    expect(result).toBeNull()
  })

  it('when the env file has a key, returns it', () => {
    const dir = mkdtempSync(join(tmpdir(), 'crow-code-aa-'))
    tempDirs.push(dir)
    const envPath = join(dir, '.env')
    writeFileSync(envPath, 'AA_API_KEY=abc')

    const result = loadApiKey(envPath)

    expect(result).toBe('abc')
  })

  it('when a catalog id matches an AA model, returns its scores', async () => {
    process.env.AA_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            {
              slug: 'deepseek-v4',
              model_creator: { name: 'DeepSeek' },
              evaluations: {
                artificial_analysis_intelligence_index: 40,
                artificial_analysis_coding_index: 60,
                artificial_analysis_agentic_index: 30,
              },
            },
          ],
          pagination: { has_more: false },
        }),
      }),
    )

    const result = await fetchAABenchmarks(new Set(['deepseek/deepseek-v4']))

    expect(result).toEqual({
      'deepseek/deepseek-v4': { intelligence: 40, coding: 60, agentic: 30 },
    })
  })

  it('when the API returns multiple pages, collects them all', async () => {
    process.env.AA_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('page=2')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ data: [], pagination: { has_more: false } }),
          })
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: [
              {
                slug: 'deepseek-v4',
                model_creator: { name: 'DeepSeek' },
                evaluations: {
                  artificial_analysis_intelligence_index: 40,
                  artificial_analysis_coding_index: 60,
                  artificial_analysis_agentic_index: 30,
                },
              },
            ],
            pagination: { has_more: true },
          }),
        })
      }),
    )

    const result = await fetchAABenchmarks(new Set(['deepseek/deepseek-v4']))

    expect(result).toEqual({
      'deepseek/deepseek-v4': { intelligence: 40, coding: 60, agentic: 30 },
    })
  })

  it('when the API responds with an error, returns an empty record', async () => {
    process.env.AA_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    )

    const result = await fetchAABenchmarks(new Set(['deepseek/deepseek-v4']))

    expect(result).toEqual({})
  })

  it('when the network request fails, returns an empty record', async () => {
    process.env.AA_API_KEY = 'test-key'
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const result = await fetchAABenchmarks(new Set(['deepseek/deepseek-v4']))

    expect(result).toEqual({})
  })

  it('when the key cannot be loaded, returns an empty record', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const missing = join(tmpdir(), 'crow-code-missing.env')

    const result = await fetchAABenchmarks(
      new Set(['deepseek/deepseek-v4']),
      missing,
    )

    expect(result).toEqual({})
    expect(errorSpy).toHaveBeenCalled()
  })

  it('when no env path is given, reads the local .env', () => {
    const result = loadApiKey()

    expect(result).not.toBeNull()
  })
})

import { describe, it, expect, vi, afterEach } from 'vitest'
import { readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { gatherModelData } from '../../src/model-discovery/gather-model-data'

const crowDirectory = join('tests', 'support', 'fixtures')

afterEach(() => {
  delete process.env.AA_API_KEY
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  rmSync(join(crowDirectory, '.crow'), { recursive: true, force: true })
})

describe('gatherModelData', () => {
  it('when run, writes a models.json in the injected crow directory', async () => {
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
            json: async () => ({
              data: [
                {
                  slug: 'deepseek-chat',
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
          })
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: [
              {
                id: 'deepseek/deepseek-chat',
                name: 'DeepSeek Chat',
                context_length: 1000,
                pricing: { prompt: '0.0000005', completion: '0.0000015' },
                reasoning: { mandatory: false, default_enabled: false },
                architecture: { modality: 'text->text' },
              },
            ],
          }),
        })
      }),
    )
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    await gatherModelData(crowDirectory)

    const saved = JSON.parse(
      readFileSync(join(crowDirectory, '.crow', 'models.json'), 'utf8'),
    )
    const fixture = JSON.parse(
      readFileSync(join(crowDirectory, 'crow-models.json'), 'utf8'),
    )
    expect(typeof saved.fetchedAt).toBe('string')
    expect(saved.sources).toEqual(fixture.sources)
    expect(saved.models).toEqual(fixture.models)
  })
})

import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  readFileSync,
  rmSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
} from 'node:fs'
import { join } from 'node:path'
import { gatherModelData } from '../../src/model-discovery/gather-model-data.js'

const crowDirectory = join('tests', 'support', 'fixtures')
const providersPath = join(crowDirectory, '.crow', 'providers.json')

afterEach(() => {
  delete process.env.AA_API_KEY
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  const modelsPath = join(crowDirectory, '.crow', 'models.json')
  try {
    rmSync(modelsPath, { force: true })
  } catch {}
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
            pagination: { has_more: false },
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

  it('when two providers return the same model id, merges the records', async () => {
    process.env.AA_API_KEY = 'test-key'

    const committedProviders = readFileSync(providersPath, 'utf8')

    const providersJson = {
      providers: [
        { name: 'nous', baseUrl: 'https://inference-api.nousresearch.com' },
        {
          name: 'ollama',
          baseUrl: 'http://pile-driver.local:11434',
          modelsUrl: 'http://pile-driver.local:11434/api/tags',
        },
      ],
    }

    writeFileSync(providersPath, JSON.stringify(providersJson))

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('pile-driver')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              models: [{ name: 'deepseek/deepseek-chat' }],
            }),
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
            pagination: { has_more: false },
          }),
        })
      }),
    )

    await gatherModelData(crowDirectory)

    const saved = JSON.parse(
      readFileSync(join(crowDirectory, '.crow', 'models.json'), 'utf8'),
    )

    expect(saved.models).toHaveLength(1)
    expect(saved.models[0].providers).toEqual(['nous', 'ollama'])

    writeFileSync(providersPath, committedProviders)
  })
})

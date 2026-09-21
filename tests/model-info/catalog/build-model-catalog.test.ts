import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { buildModelCatalog } from '../../../src/model-info/catalog/build-model-catalog.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import { mockFetchRoutes } from '../../support/mock-fetch.ts'
import pino from 'pino'

const fixtureDirectory = join(fixturesDirectory, 'build-model-catalog')

describe('buildModelCatalog', () => {
  beforeEach(() => clearDirectory(fixtureDirectory))
  afterEach(() => clearDirectory(fixtureDirectory))

  it('when run, writes a models.json in the injected crow directory', async () => {
    const crowDirectory = join(fixtureDirectory, '.crow')
    const providersPath = join(crowDirectory, 'providers.json')
    const modelsPath = join(crowDirectory, 'models.json')
    await Deno.mkdir(crowDirectory, { recursive: true })
    await Deno.writeTextFile(
      providersPath,
      JSON.stringify({
        providers: [
          { name: 'nous', baseUrl: 'https://inference-api.nousresearch.com' },
          {
            name: 'ollama',
            baseUrl: 'http://pile-driver.local:11434',
            modelsUrl: 'http://pile-driver.local:11434/api/tags',
          },
        ],
      }),
    )
    const nousModel = {
      id: 'deepseek/deepseek-chat',
      name: 'DeepSeek Chat',
      context_length: 1000,
      pricing: { prompt: '0.0000005', completion: '0.0000015' },
      reasoning: { mandatory: false, default_enabled: false },
      architecture: { modality: 'text->text' },
    }
    const catalogFetch = mockFetchRoutes([
      ['pile-driver', { models: [{ name: 'qwen3-coder:30b' }] }],
      ['nousresearch', { data: [nousModel] }],
    ])
    const logger = pino({ enabled: false })
    await buildModelCatalog(crowDirectory, logger, catalogFetch)

    const saved = JSON.parse(Deno.readTextFileSync(modelsPath))
    expect(typeof saved.fetchedAt).toBe('string')
    expect(saved.modelCount).toBe(2)
    expect(saved.models).toEqual([
      {
        id: 'deepseek/deepseek-chat',
        name: 'DeepSeek Chat',
        provider: 'nous',
        reasoning: true,
        reasoningOptions: [],
        costInput: 0.5,
        costOutput: 1.5,
        contextLength: 1000,
        modality: 'text->text',
        knowledgeCutoff: null,
        size: '',
      },
      {
        id: 'qwen3-coder:30b',
        name: 'qwen3-coder:30b',
        provider: 'ollama',
        reasoning: null,
        reasoningOptions: [],
        costInput: 0,
        costOutput: 0,
        contextLength: null,
        modality: 'local',
        knowledgeCutoff: null,
        size: '',
      },
    ])
  })

  it('when two providers return the same model id, keeps a record per provider', async () => {
    const crowDirectory = join(fixtureDirectory, '.crow')
    const providersPath = join(crowDirectory, 'providers.json')
    const modelsPath = join(crowDirectory, 'models.json')
    await Deno.mkdir(crowDirectory, { recursive: true })
    await Deno.writeTextFile(
      providersPath,
      JSON.stringify({
        providers: [
          { name: 'nous', baseUrl: 'https://inference-api.nousresearch.com' },
          {
            name: 'ollama',
            baseUrl: 'http://pile-driver.local:11434',
            modelsUrl: 'http://pile-driver.local:11434/api/tags',
          },
        ],
      }),
    )
    const catalogFetch = mockFetchRoutes([
      [
        'pile-driver',
        { models: [{ name: 'deepseek/deepseek-chat' }] },
      ],
      [
        'nousresearch',
        {
          data: [
            {
              id: 'deepseek/deepseek-chat',
              name: 'DeepSeek Chat',
              context_length: 1000,
              pricing: { prompt: '0.0000005', completion: '0.0000015' },
              reasoning: { mandatory: true, default_enabled: true },
              architecture: { modality: 'text->text' },
            },
          ],
        },
      ],
    ])
    const logger = pino({ enabled: false })
    await buildModelCatalog(crowDirectory, logger, catalogFetch)

    const saved = JSON.parse(Deno.readTextFileSync(modelsPath))

    expect(saved.models).toHaveLength(2)
    expect(saved.models[0].provider).toBe('nous')
    expect(saved.models[0].reasoning).toBe(true)
    expect(saved.models[1].provider).toBe('ollama')
    expect(saved.models[1].reasoning).toBeNull()
  })
})

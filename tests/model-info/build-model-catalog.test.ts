import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { buildModelCatalog } from '../../src/model-info/build-model-catalog.ts'
import { Environment } from '../../src/env-vars.ts'
import { mockFetchRoutes } from '../support/mock-fetch.ts'

const fixtureDirectory = join(Deno.cwd(), 'tests', 'support', 'fixtures')

describe('buildModelCatalog', () => {
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
    const aaModel = {
      slug: 'deepseek-chat',
      model_creator: { name: 'DeepSeek' },
      evaluations: {
        artificial_analysis_intelligence_index: 40,
        artificial_analysis_coding_index: 60,
        artificial_analysis_agentic_index: 30,
      },
    }
    const nousModel = {
      id: 'deepseek/deepseek-chat',
      name: 'DeepSeek Chat',
      context_length: 1000,
      pricing: { prompt: '0.0000005', completion: '0.0000015' },
      reasoning: { mandatory: false, default_enabled: false },
      architecture: { modality: 'text->text' },
    }
    const catalogFetch = mockFetchRoutes([
      [
        'artificialanalysis',
        { data: [aaModel], pagination: { has_more: false } },
      ],
      ['pile-driver', { models: [{ name: 'qwen3-coder:30b' }] }],
      ['nousresearch', { data: [nousModel] }],
    ])
    const environment = new Environment({ AA_API_KEY: 'test-key' })

    await buildModelCatalog(crowDirectory, environment, catalogFetch)

    const saved = JSON.parse(Deno.readTextFileSync(modelsPath))
    expect(typeof saved.fetchedAt).toBe('string')
    expect(saved.modelCount).toBe(2)
    expect(saved.models).toEqual([
      {
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
      },
      {
        id: 'qwen3-coder:30b',
        name: 'qwen3-coder:30b',
        providers: ['ollama'],
        reasoning: null,
        coding: null,
        codingSource: null,
        agentic: null,
        costInput: 0,
        costOutput: 0,
        contextLength: null,
        modality: 'local',
        reasoningMode: '-',
        knowledgeCutoff: null,
        size: '',
      },
    ])

    Deno.removeSync(providersPath)
    Deno.removeSync(modelsPath)
  })

  it('when two providers return the same model id, merges the records', async () => {
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
      ['artificialanalysis', { data: [], pagination: { has_more: false } }],
      ['pile-driver', { models: [{ name: 'deepseek/deepseek-chat' }] }],
      [
        'nousresearch',
        {
          data: [
            {
              id: 'deepseek/deepseek-chat',
              name: 'DeepSeek Chat',
              context_length: 1000,
              pricing: { prompt: '0.0000005', completion: '0.0000015' },
              architecture: { modality: 'text->text' },
            },
          ],
        },
      ],
    ])
    const environment = new Environment({ AA_API_KEY: 'test-key' })

    await buildModelCatalog(crowDirectory, environment, catalogFetch)

    const saved = JSON.parse(Deno.readTextFileSync(modelsPath))

    expect(saved.models).toHaveLength(1)
    expect(saved.models[0].providers).toEqual(['nous', 'ollama'])

    Deno.removeSync(providersPath)
    Deno.removeSync(modelsPath)
  })
})

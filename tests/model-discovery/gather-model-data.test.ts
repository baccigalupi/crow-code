import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import { join } from 'jsr:@std/path'
import { gatherModelData } from '../../src/model-discovery/gather-model-data.ts'
import { Environment } from '../../src/env.ts'

const fixtureDirectory = join(Deno.cwd(), 'tests', 'support', 'fixtures')

describe('gatherModelData', () => {
  it('when run, writes a models.json in the injected crow directory', async () => {
    const crowDirectory = join(fixtureDirectory, '.crow')
    const providersPath = join(crowDirectory, 'providers.json')
    const modelsPath = join(crowDirectory, 'models.json')
    const expectedModelsPath = join(fixtureDirectory, 'crow-models.json')
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
    const catalogFetch = (input: string | URL | Request) => {
      const address = String(input)
      if (address.includes('artificialanalysis')) {
        return Promise.resolve(
          Response.json({ data: [aaModel], pagination: { has_more: false } }),
        )
      }
      if (address.includes('pile-driver')) {
        return Promise.resolve(
          Response.json({ models: [{ name: 'qwen3-coder:30b' }] }),
        )
      }
      return Promise.resolve(Response.json({ data: [nousModel] }))
    }
    const environment = new Environment({ AA_API_KEY: 'test-key' })

    await gatherModelData(fixtureDirectory, environment, catalogFetch)

    const saved = JSON.parse(Deno.readTextFileSync(modelsPath))
    const expected = JSON.parse(Deno.readTextFileSync(expectedModelsPath))
    expect(typeof saved.fetchedAt).toBe('string')
    expect(saved.sources).toEqual(expected.sources)
    expect(saved.models).toEqual(expected.models)

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
    const catalogFetch = (input: string | URL | Request) => {
      const address = String(input)
      if (address.includes('artificialanalysis')) {
        return Promise.resolve(
          Response.json({ data: [], pagination: { has_more: false } }),
        )
      }
      if (address.includes('pile-driver')) {
        return Promise.resolve(
          Response.json({ models: [{ name: 'deepseek/deepseek-chat' }] }),
        )
      }
      return Promise.resolve(
        Response.json({
          data: [
            {
              id: 'deepseek/deepseek-chat',
              name: 'DeepSeek Chat',
              context_length: 1000,
              pricing: { prompt: '0.0000005', completion: '0.0000015' },
              architecture: { modality: 'text->text' },
            },
          ],
        }),
      )
    }
    const environment = new Environment({ AA_API_KEY: 'test-key' })

    await gatherModelData(fixtureDirectory, environment, catalogFetch)

    const saved = JSON.parse(Deno.readTextFileSync(modelsPath))

    expect(saved.models).toHaveLength(1)
    expect(saved.models[0].providers).toEqual(['nous', 'ollama'])

    Deno.removeSync(providersPath)
    Deno.removeSync(modelsPath)
  })
})

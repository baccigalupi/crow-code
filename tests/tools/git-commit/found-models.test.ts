import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import type { ModelInfo } from '../../../src/model-info/types.ts'
import { FoundModels } from '../../../src/tools/git-commit/found-models.ts'

const model: ModelInfo = {
  id: 'first-model',
  name: 'First Model',
  provider: 'missing',
  reasoning: false,
  reasoningOptions: [],
  costInput: 0,
  costOutput: 0,
  contextLength: 1000,
  modality: 'text->text',
  knowledgeCutoff: null,
  size: '',
}

const providers = {
  providers: [{
    name: 'nous',
    baseUrl: 'https://nous.example/v1',
    apiKeyEnv: 'NOUS_TEST_KEY',
  }],
}

describe('FoundModels', () => {
  it('when the first model is not setup, returns the next setup model', () => {
    const crowDirectory = Deno.makeTempDirSync()
    const providersPath = join(crowDirectory, 'providers.json')
    Deno.writeTextFileSync(providersPath, JSON.stringify(providers))
    Deno.env.set('NOUS_TEST_KEY', 'secret-key')
    const models = [model, { ...model, id: 'second-model', provider: 'nous' }]

    const firstModel = new FoundModels(models, crowDirectory).first()

    expect(firstModel).toEqual(models[1])
    Deno.env.delete('NOUS_TEST_KEY')
    Deno.removeSync(crowDirectory, { recursive: true })
  })

  it('when a model is setup, firstEndpoint returns its endpoint', () => {
    const crowDirectory = Deno.makeTempDirSync()
    const providersPath = join(crowDirectory, 'providers.json')
    Deno.writeTextFileSync(providersPath, JSON.stringify(providers))
    Deno.env.set('NOUS_TEST_KEY', 'secret-key')
    const models = [model, { ...model, id: 'second-model', provider: 'nous' }]

    const endpoint = new FoundModels(models, crowDirectory).firstEndpoint()

    expect(endpoint).toEqual({
      baseURL: 'https://nous.example/v1',
      apiKey: 'secret-key',
      model: 'second-model',
    })
    Deno.env.delete('NOUS_TEST_KEY')
    Deno.removeSync(crowDirectory, { recursive: true })
  })

  it('when providers cannot be loaded, firstEndpoint returns an empty endpoint', () => {
    const crowDirectory = Deno.makeTempDirSync()
    const models = [{ ...model, provider: 'nous' }]

    const endpoint = new FoundModels(models, crowDirectory).firstEndpoint()

    expect(endpoint).toEqual({ baseURL: '', apiKey: '', model: '' })
    Deno.removeSync(crowDirectory, { recursive: true })
  })
})

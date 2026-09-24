import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import type { ModelInfo } from '../../../src/model-info/types.ts'
import { Environment } from '../../../src/env-vars.ts'
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
    baseUrl: 'https://nous.example',
    apiKeyEnv: 'NOUS_TEST_KEY',
  }],
}

describe('FoundModels', () => {
  it('when a model is setup, firstEndpoint returns its endpoint', () => {
    const crowDirectory = Deno.makeTempDirSync()
    const providersPath = join(crowDirectory, 'providers.json')
    Deno.writeTextFileSync(providersPath, JSON.stringify(providers))
    const models = [{ ...model, provider: 'nous' }, {
      ...model,
      id: 'second-model',
    }]
    const environment = new Environment({ NOUS_TEST_KEY: 'secret-key' })

    const endpoint = new FoundModels(models, crowDirectory, environment)
      .firstEndpoint()

    expect(endpoint).toEqual({
      baseURL: 'https://nous.example/v1',
      apiKey: 'secret-key',
      model: 'first-model',
    })
    Deno.removeSync(crowDirectory, { recursive: true })
  })

  it('when providers cannot be loaded, firstEndpoint returns an empty endpoint', () => {
    const crowDirectory = Deno.makeTempDirSync()
    const models = [{ ...model, provider: 'nous' }]

    const endpoint = new FoundModels(models, crowDirectory, new Environment({}))
      .firstEndpoint()

    expect(endpoint).toEqual({ baseURL: '', apiKey: '', model: '' })
    Deno.removeSync(crowDirectory, { recursive: true })
  })
})

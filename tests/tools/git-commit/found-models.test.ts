import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { Environment } from '../../../src/env-vars.ts'
import type { ModelInfo } from '../../../src/model-info/types.ts'
import { FoundModels } from '../../../src/tools/git-commit/found-models.ts'

describe('FoundModels', () => {
  it('when the first model is not setup, returns the next setup model', () => {
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
    const models = [
      model,
      { ...model, id: 'second-model', provider: 'nous' },
    ]
    const providers = [{
      name: 'nous',
      baseUrl: 'https://nous.example/v1',
      apiKeyEnv: 'NOUS_TEST_KEY',
    }]
    const environment = new Environment({ NOUS_TEST_KEY: 'secret-key' })

    const firstModel = new FoundModels(models, providers, environment).first()

    expect(firstModel).toEqual(models[1])
  })
})

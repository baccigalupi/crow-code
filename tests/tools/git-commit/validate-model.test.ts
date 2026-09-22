import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { Environment } from '../../../src/env-vars.ts'
import type { ModelInfo } from '../../../src/model-info/types.ts'
import { ValidateModel } from '../../../src/tools/git-commit/validate-model.ts'

describe('ValidateModel', () => {
  it('when provider setup varies, validates only the usable model', () => {
    const model: ModelInfo = {
      id: 'model',
      name: 'Model',
      provider: 'missing-provider',
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
      { ...model, provider: 'missing-environment' },
      { ...model, provider: 'missing-key' },
      { ...model, provider: 'available' },
    ]
    const providers = [
      { name: 'missing-environment', baseUrl: 'https://missing.example/v1' },
      {
        name: 'missing-key',
        baseUrl: 'https://missing-key.example/v1',
        apiKeyEnv: 'MISSING_KEY',
      },
      {
        name: 'available',
        baseUrl: 'https://available.example/v1',
        apiKeyEnv: 'AVAILABLE_KEY',
      },
    ]
    const environment = new Environment({ AVAILABLE_KEY: 'secret-key' })

    const results = models.map((candidate) =>
      new ValidateModel(candidate, providers, environment).validate()
    )

    expect(results).toEqual([false, false, false, true])
  })
})

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { modelEndpointInfo } from '../../../src/tools/git-commit/endpoint.ts'
import { Environment } from '../../../src/env-vars.ts'

const model = {
  id: 'first-model',
  name: 'First Model',
  provider: 'nous',
  reasoning: false,
  reasoningOptions: [],
  costInput: 0,
  costOutput: 0,
  contextLength: 1000,
  modality: 'text->text',
  knowledgeCutoff: null,
  size: '',
}

const writeCatalog = (crowDirectory: string, models: unknown[]) => {
  Deno.writeTextFileSync(
    join(crowDirectory, 'models.json'),
    JSON.stringify({ fetchedAt: '', modelCount: models.length, models }),
  )
}

const writeProviders = (crowDirectory: string, providers: unknown[]) => {
  Deno.writeTextFileSync(
    join(crowDirectory, 'providers.json'),
    JSON.stringify({ providers }),
  )
}

describe('modelEndpointInfo', () => {
  it('when configured, value returns the endpoint and is available', () => {
    const crowDirectory = Deno.makeTempDirSync()
    writeCatalog(crowDirectory, [model])
    writeProviders(crowDirectory, [{
      name: 'nous',
      baseUrl: 'https://nous.example',
      apiKeyEnv: 'NOUS_TEST_KEY',
    }])
    const environment = new Environment({ NOUS_TEST_KEY: 'secret-key' })

    const endpoint = modelEndpointInfo(crowDirectory, environment)

    expect(endpoint.isAvailable()).toBe(true)
    expect(endpoint.value()).toEqual({
      baseURL: 'https://nous.example/v1',
      apiKey: 'secret-key',
      model: 'first-model',
    })
    Deno.removeSync(crowDirectory, { recursive: true })
  })

  it('when no model is available, value returns an empty endpoint and is not available', () => {
    const crowDirectory = Deno.makeTempDirSync()

    const endpoint = modelEndpointInfo(crowDirectory, new Environment({}))

    expect(endpoint.isAvailable()).toBe(false)
    expect(endpoint.value()).toEqual({ baseURL: '', apiKey: '', model: '' })
    Deno.removeSync(crowDirectory, { recursive: true })
  })
})

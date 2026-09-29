import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { Environment } from '../../../src/env-vars.ts'
import { modelEntity } from '../../../src/domain/models/model.ts'
import type { ProviderEntity } from '../../../src/domain/providers/entity.ts'
import { providerEntity } from '../../../src/domain/providers/entity.ts'
import { FoundModels } from '../../../src/tasks/git-commit/found-models.ts'
import { testModelRow, testProviderRow } from '../../support/model-rows.ts'

describe('FoundModels', () => {
  it('when a model is setup, firstEndpoint returns its endpoint', () => {
    const environment = new Environment({ NOUS_TEST_KEY: 'secret-key' })
    const providers = [
      providerEntity({ id: 1, ...testProviderRow() }, environment),
    ] as ProviderEntity[]
    const models = [
      modelEntity({ id: 1, ...testModelRow() }),
      modelEntity({ id: 2, ...testModelRow({ identifier: 'second-model' }) }),
    ]

    const endpoint = new FoundModels(models, providers).firstEndpoint()

    expect(endpoint).toEqual({
      baseURL: 'https://nous.example/v1',
      apiKey: 'secret-key',
      model: 'first-model',
    })
  })

  it('when the model provider is missing, firstEndpoint returns an empty endpoint', () => {
    const environment = new Environment({})
    const providers = [
      providerEntity({ id: 1, ...testProviderRow() }, environment),
    ] as ProviderEntity[]
    const models = [modelEntity({ id: 1, ...testModelRow({ provider_id: 2 }) })]

    const endpoint = new FoundModels(models, providers).firstEndpoint()

    expect(endpoint).toEqual({ baseURL: '', apiKey: '', model: '' })
  })

  it('when there are no models, firstEndpoint returns an empty endpoint', () => {
    const environment = new Environment({})
    const providers = [
      providerEntity({ id: 1, ...testProviderRow() }, environment),
    ] as ProviderEntity[]

    const endpoint = new FoundModels([], providers).firstEndpoint()

    expect(endpoint).toEqual({ baseURL: '', apiKey: '', model: '' })
  })

  it('when the provider has no api key env var, apiKey is empty', () => {
    const environment = new Environment({})
    const providers = [
      providerEntity(
        { id: 1, ...testProviderRow({ api_key_env_var: null }) },
        environment,
      ),
    ] as ProviderEntity[]
    const models = [modelEntity({ id: 1, ...testModelRow() })]

    const endpoint = new FoundModels(models, providers).firstEndpoint()

    expect(endpoint.apiKey).toBe('')
  })
})

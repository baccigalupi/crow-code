import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { modelEndpointInfo } from '../../../src/tasks/git-commit/endpoint.ts'
import { Environment } from '../../../src/env-vars.ts'
import { createTestDatabase } from '../../support/test-database.ts'
import { testModelRow, testProviderRow } from '../../support/model-rows.ts'

describe('modelEndpointInfo', () => {
  it('when configured, value returns the endpoint and is available', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert(testProviderRow())
    await database('models').insert([
      testModelRow({
        identifier: 'mandatory-reasoning',
        supports_reasoning: 1,
        can_disable_reasoning: 0,
      }),
      testModelRow({ identifier: 'first-model' }),
    ])
    const environment = new Environment({ NOUS_TEST_KEY: 'secret-key' })

    const endpoint = await modelEndpointInfo(database, environment, logger)

    expect(endpoint.isAvailable()).toBe(true)
    expect(endpoint.value()).toEqual({
      baseURL: 'https://nous.example/v1',
      apiKey: 'secret-key',
      model: 'first-model',
    })
    await database.destroy()
  })

  it('uses an optional-reasoning model when it is the only cheap model', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert(testProviderRow())
    await database('models').insert(
      testModelRow({
        identifier: 'optional-reasoning',
        supports_reasoning: 1,
        can_disable_reasoning: 1,
        reasoning_options: '{"mandatory":false}',
      }),
    )
    const environment = new Environment({ NOUS_TEST_KEY: 'secret-key' })

    const endpoint = await modelEndpointInfo(database, environment, logger)

    expect(endpoint.isAvailable()).toBe(true)
    expect(endpoint.value().model).toBe('optional-reasoning')
    await database.destroy()
  })

  it('when no model is available, value returns an empty endpoint and is not available', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)

    const endpoint = await modelEndpointInfo(
      database,
      new Environment({}),
      logger,
    )

    expect(endpoint.isAvailable()).toBe(false)
    expect(endpoint.value()).toEqual({ baseURL: '', apiKey: '', model: '' })
    await database.destroy()
  })

  it('when the model provider is missing, is not available', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert(testProviderRow())
    await database('models').insert(testModelRow({ provider_id: 2 }))

    const endpoint = await modelEndpointInfo(
      database,
      new Environment({ NOUS_TEST_KEY: 'secret-key' }),
      logger,
    )

    expect(endpoint.isAvailable()).toBe(false)
    expect(endpoint.value()).toEqual({ baseURL: '', apiKey: '', model: '' })
    await database.destroy()
  })
})

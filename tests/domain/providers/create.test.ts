import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import pino from 'pino'
import {
  CreateProvider,
  createProvider,
} from '../../../src/domain/providers/create.ts'
import { createTestDatabase } from '../../support/test-database.ts'

describe('create', () => {
  it('when attributes use mixed cases and include extra values, normalizes and filters them', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)

    const creator = await createProvider(database, logger, {
      name: 'provider-name',
      baseUrl: 'https://www.example.com',
      'models-path': '/v1/models',
      apiKeyEnvVar: 'X',
      extra: 'ignored',
    })

    expect(creator.success()).toBe(true)
    expect(creator.record()).toEqual({
      id: expect.any(Number),
      name: 'provider-name',
      base_url: 'https://www.example.com',
      models_path: '/v1/models',
      api_key_env_var: 'X',
    })
    await database.destroy()
  })

  it('when create has not been called, success is false and the record is empty', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)

    const creator = new CreateProvider(database, logger, {})

    expect(creator.success()).toBe(false)
    expect(creator.record()).toEqual({})
    await database.destroy()
  })

  it('when the provider already exists, reports failure', async () => {
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')
    const database = await createTestDatabase(logger)
    await database('providers').insert({
      name: 'provider-name',
      base_url: 'https://www.example.com',
    })

    const creator = await createProvider(database, logger, {
      name: 'provider-name',
      'base-url': 'https://www.example.com',
    })

    expect(creator.success()).toBe(false)
    expect(creator.record()).toEqual({})
    assertSpyCall(loggerErrorSpy, 0, {
      args: [
        "insert into `providers` (`base_url`, `name`) values ('https://www.example.com', 'provider-name') returning * - UNIQUE constraint failed: providers.base_url",
      ],
    })
    await database.destroy()
  })
})

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import pino from 'pino'
import { CreateRecord } from '../../src/domain/create.ts'
import { createTestDatabase } from '../support/test-database.ts'

describe('CreateRecord', () => {
  it('inserts the given params into the subclass table', async () => {
    type Params = { name: string; base_url: string }
    type Row = Params & {
      id: number
      models_path: string | null
      api_key_env_var: string | null
    }
    class CreateProvider extends CreateRecord<Params, Row> {
      protected readonly tableName = 'providers'
    }
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const creator = new CreateProvider(database, logger, {
      name: 'provider-name',
      base_url: 'https://www.example.com',
    })

    await creator.create()

    expect(creator.success()).toBe(true)
    expect(creator.record()).toEqual({
      id: expect.any(Number),
      name: 'provider-name',
      base_url: 'https://www.example.com',
      models_path: null,
      api_key_env_var: null,
    })
    await database.destroy()
  })

  it('allows subclasses to override params', async () => {
    type Params = { providerName: string; baseUrl: string }
    type InsertParams = { name: string; base_url: string }
    type Row = {
      id: number
      name: string
      base_url: string
      models_path: string | null
      api_key_env_var: string | null
    }
    class CreateProvider extends CreateRecord<Params, Row, InsertParams> {
      protected readonly tableName = 'providers'

      protected override params(): InsertParams {
        return {
          name: this.recordParams.providerName,
          base_url: this.recordParams.baseUrl,
        }
      }
    }
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const creator = new CreateProvider(database, logger, {
      providerName: 'provider-name',
      baseUrl: 'https://www.example.com',
    })

    await creator.create()

    expect(creator.success()).toBe(true)
    expect(creator.record()).toEqual({
      id: expect.any(Number),
      name: 'provider-name',
      base_url: 'https://www.example.com',
      models_path: null,
      api_key_env_var: null,
    })
    await database.destroy()
  })

  it('logs insert failures and leaves the record empty', async () => {
    type Params = { name: string; base_url: string }
    type Row = Params & { id: number }
    class CreateProvider extends CreateRecord<Params, Row> {
      protected readonly tableName = 'providers'
    }
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')
    const database = await createTestDatabase(logger)
    const params = {
      name: 'provider-name',
      base_url: 'https://www.example.com',
    }
    await database('providers').insert(params)
    const creator = new CreateProvider(database, logger, params)

    await creator.create()

    expect(creator.success()).toBe(false)
    expect(creator.record()).toEqual({})
    assertSpyCall(loggerErrorSpy, 0)
    await database.destroy()
  })
})

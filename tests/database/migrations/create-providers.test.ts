import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { createProviders } from '../../../src/database/migrations/create-providers.ts'
import { createTestDatabase } from '../../support/test-database.ts'

describe('createProviders', () => {
  it('when migrated, creates the providers columns', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)

    const columns = await database('providers').columnInfo()

    expect(Object.keys(columns)).toEqual([
      'id',
      'name',
      'base_url',
      'models_path',
      'api_key_env_var',
    ])
    expect(Object.values(columns).map(({ nullable }) => nullable)).toEqual([
      false,
      false,
      false,
      true,
      true,
    ])
    await database.destroy()
  })

  it('when rolled back, drops the providers table', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)

    await createProviders.down!(database)

    expect(await database.schema.hasTable('providers')).toBe(false)
    await database.destroy()
  })
})

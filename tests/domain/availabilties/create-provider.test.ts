import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { createProviderAvailability } from '../../../src/domain/availabilties/create-provider.ts'
import { createTestDatabase } from '../../support/test-database.ts'

describe('create provider availability', () => {
  it('saves a provider availability record', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)

    const creator = await createProviderAvailability(database, logger, {
      providerId: 1,
      reason: 'rate_limited',
    }).create()

    expect(creator.success()).toBe(true)
    expect(creator.record()).toEqual({
      id: expect.any(Number),
      provider_id: 1,
      reason: 'rate_limited',
      retry_at: null,
      updated_at: expect.any(String),
    })
    await database.destroy()
  })
})

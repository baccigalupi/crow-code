import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { createModelAvailability } from '../../../src/domain/availabilties/create-model.ts'
import { createTestDatabase } from '../../support/test-database.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('create model availability', () => {
  it('saves a model availability record', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)

    const creator = await createModelAvailability(
      mockApplicationData({ database, logger }),
      {
        modelId: 1,
        reason: 'no-api-key',
      },
    ).create()

    expect(creator.success()).toBe(true)
    expect(creator.record()).toEqual({
      id: expect.any(Number),
      model_id: 1,
      reason: 'no-api-key',
      retry_at: null,
      updated_at: expect.any(String),
    })
    await database.destroy()
  })
})

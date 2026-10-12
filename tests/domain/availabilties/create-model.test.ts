import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { createModelAvailability } from '../../../src/domain/availabilties/create-model.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('create model availability', () => {
  it('saves a model availability record', async () => {
    const applicationData = mockApplicationData()

    const creator = await createModelAvailability(
      applicationData,
      {
        modelId: 1,
        reason: 'no-api-key',
      },
    ).run()

    expect(creator.success()).toBe(true)
    expect(creator.result()).toEqual({
      id: expect.any(Number),
      model_id: 1,
      reason: 'no-api-key',
      retry_at: null,
      updated_at: expect.any(String),
    })
  })
})

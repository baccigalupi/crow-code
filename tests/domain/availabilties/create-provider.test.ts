import { describe, expect, it } from 'bun:test'
import { createProviderAvailability } from '../../../src/domain/availabilties/create-provider.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('create provider availability', () => {
  it('saves a provider availability record', async () => {
    const applicationData = mockApplicationData()

    const creator = await createProviderAvailability(
      applicationData,
      {
        providerId: 1,
        reason: 'no-api-key',
      },
    ).run()

    expect(creator.success()).toBe(true)
    expect(creator.result()).toEqual({
      id: expect.any(Number),
      provider_id: 1,
      reason: 'no-api-key',
      retry_at: null,
      updated_at: expect.any(String),
    })
  })
})

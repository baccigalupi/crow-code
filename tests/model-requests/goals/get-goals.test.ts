import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { GetGoals } from '../../../src/model-requests/goals/get-goals.ts'
import type { CommandApplicationData } from '../../../src/types.ts'

describe('GetGoals', () => {
  it('when perform is called, writes the request messages onto the class', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
    }
    const applicationData = {} as CommandApplicationData
    const getGoals = new GetGoals(modelEndpoint, applicationData, 'build a cli')

    await getGoals.perform()

    expect(getGoals.messages[0].content).toContain('extracting goals')
    expect(getGoals.messages[1].content).toContain('build a cli')
  })
})

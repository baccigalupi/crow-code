import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { GetGoals } from '../../../src/model-requests/goals/get-goals.ts'
import { CallApi } from '../../../src/model-requests/framework/call-api.ts'
import type { CommandApplicationData } from '../../../src/types.ts'

describe('GetGoals', () => {
  it('when perform is called, writes the request messages onto the class', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
    }
    const applicationData = {
      fetchClient: () => Promise.resolve(new Response('{}')),
    } as unknown as CommandApplicationData
    const getGoals = new GetGoals(modelEndpoint, applicationData, 'build a cli')

    await getGoals.perform()

    expect(getGoals.messages[0].role).toBe('system')
    expect(getGoals.messages[0].content).toContain('extracting goals')
    expect(getGoals.messages[1].role).toBe('user')
    expect(getGoals.messages[1].content).toContain('build a cli')
  })

  it('when perform is called, writes the request object onto the class', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
    }
    const applicationData = {
      fetchClient: () => Promise.resolve(new Response('{}')),
    } as unknown as CommandApplicationData
    const getGoals = new GetGoals(modelEndpoint, applicationData, 'build a cli')

    await getGoals.perform()

    expect(getGoals.requestObject).toBeInstanceOf(Request)
    expect(getGoals.requestObject.headers.get('authorization')).toBe(
      'Bearer test-key',
    )
  })

  it('when perform is called, writes the api request onto the class', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
    }
    const applicationData = {
      fetchClient: () => Promise.resolve(new Response('{}')),
    } as unknown as CommandApplicationData
    const getGoals = new GetGoals(modelEndpoint, applicationData, 'build a cli')

    await getGoals.perform()

    expect(getGoals.apiRequest).toBeInstanceOf(CallApi)
    expect(getGoals.apiRequest.success()).toBe(true)
  })
})

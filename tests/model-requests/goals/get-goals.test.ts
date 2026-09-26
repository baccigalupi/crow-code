import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { GetGoals } from '../../../src/model-requests/goals/get-goals.ts'
import { CallApi } from '../../../src/model-requests/framework/call-api.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockFetchError, mockFetchSuccess } from '../../support/mock-fetch.ts'
import { loadFixture } from '../../support/fixtures.ts'
import type { ChatCompletionJson } from '../../../src/model-requests/types.ts'

describe('GetGoals', () => {
  it('when perform is called, writes the request messages onto the class', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
    }
    const applicationData = mockApplicationData({
      fetchClient: mockFetchSuccess({
        choices: [{ message: { content: '[]' } }],
      }),
    })
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
    const applicationData = mockApplicationData({
      fetchClient: mockFetchSuccess({
        choices: [{ message: { content: '[]' } }],
      }),
    })
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
    const applicationData = mockApplicationData({
      fetchClient: mockFetchSuccess({
        choices: [{ message: { content: '[]' } }],
      }),
    })
    const getGoals = new GetGoals(modelEndpoint, applicationData, 'build a cli')

    await getGoals.perform()

    expect(getGoals.apiRequest).toBeInstanceOf(CallApi)
    expect(getGoals.apiRequest.success()).toBe(true)
  })

  it('when the api call succeeds, returns the parsed goals', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
    }
    const fixture = await loadFixture(
      'model-requests/ollama-goals-response.json',
    ) as ChatCompletionJson
    const applicationData = mockApplicationData({
      fetchClient: mockFetchSuccess(fixture),
    })
    const getGoals = new GetGoals(modelEndpoint, applicationData, 'build a cli')

    const goals = await getGoals.perform()

    expect(goals).toEqual(
      JSON.parse(fixture.choices[0].message.content),
    )
  })

  it('when the api call fails, returns an empty goals list', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
    }
    const applicationData = mockApplicationData({
      fetchClient: mockFetchError(500),
    })
    const getGoals = new GetGoals(modelEndpoint, applicationData, 'build a cli')

    const goals = await getGoals.perform()

    expect(goals).toEqual([])
  })
})

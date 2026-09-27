import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { GetGoals, getGoals } from '../../src/model-requests/goals.ts'
import type { ChatCompletionJson } from '../../src/model-requests/types.ts'
import { loadFixture } from '../support/fixtures.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'
import { mockFetchError, mockFetchSuccess } from '../support/mock-fetch.ts'

describe('goals', () => {
  it('when run is called, writes the goal request messages onto the class', async () => {
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

    await getGoals.run()

    expect(getGoals.messages[0].role).toBe('system')
    expect(getGoals.messages[0].content).toContain('extracting goals')
    expect(getGoals.messages[1].role).toBe('user')
    expect(getGoals.messages[1].content).toContain('build a cli')
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

    const goals = await getGoals.run()

    expect(goals).toEqual([])
  })

  it('when called through getGoals, returns the parsed goals', async () => {
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

    const goals = await getGoals(modelEndpoint, applicationData, 'build a cli')

    expect(goals).toEqual(JSON.parse(fixture.choices[0].message.content))
  })
})

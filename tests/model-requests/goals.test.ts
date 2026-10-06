import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { GetGoals, getGoals } from '../../src/model-requests/goals.ts'
import type { ChatCompletionJson } from '../../src/model-requests/types.ts'
import { loadFixture } from '../support/fixtures.ts'
import { createTestDatabase } from '../support/test-database.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'
import { mockFetchError, mockFetchSuccess } from '../support/mock-fetch.ts'

describe('goals', () => {
  it('when run is called, writes the goal request messages onto the class', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
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
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchError(500),
    })
    const getGoals = new GetGoals(modelEndpoint, applicationData, 'build a cli')

    await getGoals.run()

    expect(getGoals.result()).toEqual([])
    expect(getGoals.failureReason()).toBe('api-error')
  })

  it('when the response is not an array of strings, returns an empty goals list and records invalid-schema', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [{ message: { content: '{"goals": []}' } }],
        usage: { completion_tokens: 1 },
      }),
    })
    const getGoals = new GetGoals(modelEndpoint, applicationData, 'build a cli')

    await getGoals.run()

    expect(getGoals.result()).toEqual([])
    expect(getGoals.success()).toBe(false)
    expect(getGoals.failureReason()).toBe('invalid-schema')
  })

  it('when the api call fails, the runner reports failure', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert({
      id: 1,
      name: 'Provider',
      base_url: 'https://example.com/v1',
    })
    await database('models').insert({
      provider_id: 1,
      identifier: 'first',
      name: 'First',
      context_length: 1000,
      cost_input: 0,
      cost_output: 0,
      dynamic_delegation: false,
      modality: 'text->text',
      supported_parameters: '[]',
      supports_reasoning: false,
      can_disable_reasoning: false,
      reasoning_options: '{}',
    })
    const fetch = mockFetchError(500)
    const applicationData = mockApplicationData({ database, logger, fetch })

    const runner = await getGoals(applicationData, 'build a cli')

    expect(runner.success()).toBe(false)
    expect(runner.result()).toBeUndefined()
    await database.destroy()
  })

  it('when the api call succeeds, the runner returns the goals', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert({
      id: 1,
      name: 'Provider',
      base_url: 'https://example.com/v1',
    })
    await database('models').insert({
      provider_id: 1,
      identifier: 'first',
      name: 'First',
      context_length: 1000,
      cost_input: 0,
      cost_output: 0,
      dynamic_delegation: false,
      modality: 'text->text',
      supported_parameters: '[]',
      supports_reasoning: false,
      can_disable_reasoning: false,
      reasoning_options: '{}',
    })
    const fixture = await loadFixture(
      'model-requests/ollama-goals-response.json',
    ) as ChatCompletionJson
    const fetch = mockFetchSuccess(fixture)
    const applicationData = mockApplicationData({ database, logger, fetch })

    const runner = await getGoals(applicationData, 'build a cli')

    expect(runner.success()).toBe(true)
    expect(runner.result()).toEqual([
      'Create API response fixtures for all three providers used in the app',
      'Extract unfiltered JSON payloads from fetch requests for each provider',
      'Use ollama models for free low-cost options',
      'Include the exact JSON responses as they appear in the fetch calls',
      'Generate fixtures using the specified prompt in chat completion requests',
      'Reference .crow/models.json to identify available models',
    ])
    await database.destroy()
  })
})

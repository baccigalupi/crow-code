import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { spy } from '@std/testing/mock'
import { OpenAiRequest } from '../../../src/model-requests/framework/openai-request.ts'
import { ModelRequestErrorHandler } from '../../../src/model-requests/framework/model-request-error-handler.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchResponse,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'

describe('ModelRequestErrorHandler', () => {
  it('when the api call fails, logs the request context and response detail', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchResponse(
        () => new Response('{"message":"Not Found"}', { status: 404 }),
      ),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
    const apiRequest = new OpenAiRequest({
      applicationData,
      operationArguments: {
        modelEndpoint,
        messages: [{ role: 'user', content: 'build a cli' }],
      },
    })

    await apiRequest.run()

    const logged = loggerErrorSpy.calls[0].args[0] as string
    expect(logged).toContain(
      'Error: POST https://example.com/api/v1/chat/completions',
    )
    expect(logged).toContain('model=test-model provider=1')
    expect(logged).toContain('returned 404')
    expect(logged).toContain(
      'request: {"model":"test-model","messages":[{"role":"user","length":11}]}',
    )
    expect(logged).toContain('response: {"message":"Not Found"}')
    expect(logged).not.toContain('build a cli')
    expect(logged).not.toContain('test-key')
  })

  it('when the network request fails, logs the error name and message', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchRejected('socket hangup'),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
    const apiRequest = new OpenAiRequest({
      applicationData,
      operationArguments: {
        modelEndpoint,
        messages: [{ role: 'user', content: 'hi' }],
      },
    })

    await apiRequest.run()

    const logged = loggerErrorSpy.calls[0].args[0] as string
    expect(logged).toContain('model=test-model provider=1')
    expect(logged).toContain('failed to connect:')
    expect(logged).toContain(
      'request: {"model":"test-model","messages":[{"role":"user","length":2}]}',
    )
    expect(logged).toContain('socket hangup')
  })

  it('when the request failed without an api token, creates a provider availability record', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: '',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchError(401),
    })
    const database = await applicationData.database()
    const apiRequest = new OpenAiRequest({
      applicationData,
      operationArguments: { modelEndpoint, messages: [] },
    })
    await apiRequest.run()

    await new ModelRequestErrorHandler(
      applicationData,
      modelEndpoint,
      apiRequest.url,
      apiRequest.error as Error,
      { messages: [], timespan: apiRequest.benchmark() },
    ).run()

    const rows = await database('provider_availabilities')
    expect(rows).toHaveLength(1)
    expect(rows[0].provider_id).toBe(1)
    expect(rows[0].reason).toBe('no-api-key')
  })

  it('when the request failed with an api token, does not create a provider availability record', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchError(500),
    })
    const database = await applicationData.database()
    const apiRequest = new OpenAiRequest({
      applicationData,
      operationArguments: { modelEndpoint, messages: [] },
    })
    await apiRequest.run()

    await new ModelRequestErrorHandler(
      applicationData,
      modelEndpoint,
      apiRequest.url,
      apiRequest.error as Error,
      { messages: [], timespan: apiRequest.benchmark() },
    ).run()

    const rows = await database('provider_availabilities')
    expect(rows).toHaveLength(0)
  })

  it('when the request succeeded, does not create a provider availability record', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: '',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [{ message: { content: '[]' } }],
      }),
    })
    const database = await applicationData.database()

    const apiRequest = new OpenAiRequest({
      applicationData,
      operationArguments: { modelEndpoint, messages: [] },
    })
    await apiRequest.run()

    const rows = await database('provider_availabilities')
    expect(rows).toHaveLength(0)
  })
})

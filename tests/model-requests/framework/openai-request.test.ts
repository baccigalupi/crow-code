import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { APIConnectionError } from 'openai'
import type { APIError } from 'openai'
import { OpenAiRequest } from '../../../src/model-requests/framework/openai-request.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import {
  mockOpenAiClient,
  mockOpenAiClientError,
  mockOpenAiClientNetworkError,
} from '../../support/mock-openai-client.ts'
import { mockFetchSequence } from '../../support/mock-fetch.ts'

describe('OpenAiRequest', () => {
  it('when the completion succeeds, reports success and returns parsed json', async () => {
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClient('["a goal"]'),
    })
    const request = new OpenAiRequest({
      applicationData,
      operationArguments: {
        modelEndpoint: {
          baseURL: 'https://example.com/api/v1',
          apiKey: 'test-key',
          model: 'test-model',
          providerId: 1,
        },
        messages: [{ role: 'user', content: 'build a cli' }],
      },
    })

    await request.run()

    expect(request.success()).toBe(true)
    const json = request.result()
    expect(json).toBeDefined()
    expect(json!.choices[0].message.content).toBe('["a goal"]')
  })

  it('when the completion succeeds, records the request duration', async () => {
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClient('["a goal"]'),
    })
    const request = new OpenAiRequest({
      applicationData,
      operationArguments: {
        modelEndpoint: {
          baseURL: 'https://example.com/api/v1',
          apiKey: 'test-key',
          model: 'test-model',
          providerId: 1,
        },
        messages: [{ role: 'user', content: 'build a cli' }],
      },
    })

    await request.run()

    const benchmark = request.benchmark()
    expect(benchmark.startTime).toBeGreaterThan(0)
    expect(benchmark.endTime).toBeGreaterThanOrEqual(benchmark.startTime)
  })

  it('when constructed, exposes the chat completions url for the endpoint', () => {
    const applicationData = mockApplicationData()
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const messages = [{ role: 'user', content: 'build a cli' }]

    const request = new OpenAiRequest({
      applicationData,
      operationArguments: { modelEndpoint, messages },
    })

    expect(request.url).toBe('https://example.com/api/v1/chat/completions')
  })

  it('when the api call throws a connection error, reports failure and exposes the error', async () => {
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClientNetworkError('down'),
    })
    const request = new OpenAiRequest({
      applicationData,
      operationArguments: {
        modelEndpoint: {
          baseURL: 'https://example.com/api/v1',
          apiKey: 'test-key',
          model: 'test-model',
          providerId: 1,
        },
        messages: [{ role: 'user', content: 'build a cli' }],
      },
    })

    await request.run()

    expect(request.success()).toBe(false)
    expect(request.error).toBeInstanceOf(APIConnectionError)
  })

  it('when the api returns 401, reports failure with the status', async () => {
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClientError(401),
    })
    const request = new OpenAiRequest({
      applicationData,
      operationArguments: {
        modelEndpoint: {
          baseURL: 'https://example.com/api/v1',
          apiKey: 'test-key',
          model: 'test-model',
          providerId: 1,
        },
        messages: [{ role: 'user', content: 'build a cli' }],
      },
    })

    await request.run()

    expect(request.success()).toBe(false)
    expect((request.error as APIError).status).toBe(401)
  })

  it('when the endpoint has an api key, constructs the client with it', async () => {
    const chatClient = mock.fn(mockOpenAiClient(''))
    const applicationData = mockApplicationData({ chatClient })
    const request = new OpenAiRequest({
      applicationData,
      operationArguments: {
        modelEndpoint: {
          baseURL: 'https://example.com/api/v1',
          apiKey: 'test-key',
          model: 'test-model',
          providerId: 1,
        },
        messages: [{ role: 'user', content: 'build a cli' }],
      },
    })

    await request.run()

    expect(chatClient.mock.calls[0].arguments[0]).toEqual({
      apiKey: 'test-key',
      baseURL: 'https://example.com/api/v1',
    })
  })

  it('when the endpoint has no api key, constructs the client with the placeholder', async () => {
    const chatClient = mock.fn(mockOpenAiClient(''))
    const applicationData = mockApplicationData({ chatClient })
    const request = new OpenAiRequest({
      applicationData,
      operationArguments: {
        modelEndpoint: {
          baseURL: 'https://example.com/api/v1',
          apiKey: '',
          model: 'test-model',
          providerId: 1,
        },
        messages: [{ role: 'user', content: 'build a cli' }],
      },
    })

    await request.run()

    expect(chatClient.mock.calls[0].arguments[0]).toEqual({
      apiKey: 'crow-no-api-key',
      baseURL: 'https://example.com/api/v1',
    })
  })

  it('when the first attempt returns 500 and the second succeeds, reports success', async () => {
    const fetchMock = mockFetchSequence([
      new Response(null, { status: 500 }),
      Response.json({ choices: [{ message: { content: '["a goal"]' } }] }),
    ])
    const applicationData = mockApplicationData({ fetch: fetchMock })
    const request = new OpenAiRequest({
      applicationData,
      operationArguments: {
        modelEndpoint: {
          baseURL: 'https://example.com/api/v1',
          apiKey: 'test-key',
          model: 'test-model',
          providerId: 1,
        },
        messages: [{ role: 'user', content: 'build a cli' }],
      },
    })

    await request.run()

    expect(request.success()).toBe(true)
    expect(fetchMock.calls).toHaveLength(2)
  })
})

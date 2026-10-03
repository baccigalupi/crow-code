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
      openAiClient: mockOpenAiClient('["a goal"]'),
    })
    const request = new OpenAiRequest(
      {
        baseURL: 'https://example.com/api/v1',
        apiKey: 'test-key',
        model: 'test-model',
        providerId: 1,
      },
      [{ role: 'user', content: 'build a cli' }],
      applicationData,
    )

    await request.run()

    expect(request.success()).toBe(true)
    const json = await request.json()
    expect(json).toBeDefined()
    expect(json!.choices[0].message.content).toBe('["a goal"]')
  })

  it('when the completion succeeds, records the request duration', async () => {
    const applicationData = mockApplicationData({
      openAiClient: mockOpenAiClient('["a goal"]'),
    })
    const request = new OpenAiRequest(
      {
        baseURL: 'https://example.com/api/v1',
        apiKey: 'test-key',
        model: 'test-model',
        providerId: 1,
      },
      [{ role: 'user', content: 'build a cli' }],
      applicationData,
    )

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

    const request = new OpenAiRequest(modelEndpoint, messages, applicationData)

    expect(request.url).toBe('https://example.com/api/v1/chat/completions')
  })

  it('when the api call throws a connection error, reports failure and exposes the error', async () => {
    const applicationData = mockApplicationData({
      openAiClient: mockOpenAiClientNetworkError('down'),
    })
    const request = new OpenAiRequest(
      {
        baseURL: 'https://example.com/api/v1',
        apiKey: 'test-key',
        model: 'test-model',
        providerId: 1,
      },
      [{ role: 'user', content: 'build a cli' }],
      applicationData,
    )

    await request.run()

    expect(request.success()).toBe(false)
    expect(request.error).toBeInstanceOf(APIConnectionError)
  })

  it('when the api returns 401, reports failure with the status', async () => {
    const applicationData = mockApplicationData({
      openAiClient: mockOpenAiClientError(401),
    })
    const request = new OpenAiRequest(
      {
        baseURL: 'https://example.com/api/v1',
        apiKey: 'test-key',
        model: 'test-model',
        providerId: 1,
      },
      [{ role: 'user', content: 'build a cli' }],
      applicationData,
    )

    await request.run()

    expect(request.success()).toBe(false)
    expect((request.error as APIError).status).toBe(401)
  })

  it('when the endpoint has an api key, constructs the client with it', async () => {
    const openAiClient = mock.fn(mockOpenAiClient(''))
    const applicationData = mockApplicationData({ openAiClient })
    const request = new OpenAiRequest(
      {
        baseURL: 'https://example.com/api/v1',
        apiKey: 'test-key',
        model: 'test-model',
        providerId: 1,
      },
      [{ role: 'user', content: 'build a cli' }],
      applicationData,
    )

    await request.run()

    expect(openAiClient.mock.calls[0].arguments[0].apiKey).toBe('test-key')
    expect(openAiClient.mock.calls[0].arguments[0].baseURL).toBe(
      'https://example.com/api/v1',
    )
  })

  it('when the endpoint has no api key, constructs the client with the placeholder', async () => {
    const openAiClient = mock.fn(mockOpenAiClient(''))
    const applicationData = mockApplicationData({ openAiClient })
    const request = new OpenAiRequest(
      {
        baseURL: 'https://example.com/api/v1',
        apiKey: '',
        model: 'test-model',
        providerId: 1,
      },
      [{ role: 'user', content: 'build a cli' }],
      applicationData,
    )

    await request.run()

    expect(openAiClient.mock.calls[0].arguments[0].apiKey).toBe(
      'crow-no-api-key',
    )
  })

  it('when the first attempt returns 500 and the second succeeds, reports success', async () => {
    const fetchMock = mockFetchSequence([
      new Response(null, { status: 500 }),
      Response.json({ choices: [{ message: { content: '["a goal"]' } }] }),
    ])
    const applicationData = mockApplicationData({ fetchClient: fetchMock })
    const request = new OpenAiRequest(
      {
        baseURL: 'https://example.com/api/v1',
        apiKey: 'test-key',
        model: 'test-model',
        providerId: 1,
      },
      [{ role: 'user', content: 'build a cli' }],
      applicationData,
    )

    await request.run()

    expect(request.success()).toBe(true)
    expect(fetchMock.calls).toHaveLength(2)
  })
})

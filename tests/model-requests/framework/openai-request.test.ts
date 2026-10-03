import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { APIConnectionError, AuthenticationError } from 'openai'
import type { APIError } from 'openai'
import type OpenAI from 'openai'
import type { OpenAiClientOptions } from '../../../src/model-requests/types.ts'
import { OpenAiRequest } from '../../../src/model-requests/framework/openai-request.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockFetchSequence } from '../../support/mock-fetch.ts'

describe('OpenAiRequest', () => {
  it('when the completion succeeds, reports success and returns parsed json', async () => {
    const client = {
      chat: {
        completions: {
          create: () =>
            Promise.resolve({
              choices: [{ message: { content: '["a goal"]' } }],
            }),
        },
      },
    } as unknown as OpenAI
    const applicationData = mockApplicationData({
      openAiClientFactory: () => client,
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
    expect(await request.json()).toEqual({
      choices: [{ message: { content: '["a goal"]' } }],
    })
  })

  it('when the completion succeeds, records the request duration', async () => {
    const client = {
      chat: {
        completions: {
          create: () =>
            Promise.resolve({
              choices: [{ message: { content: '["a goal"]' } }],
            }),
        },
      },
    } as unknown as OpenAI
    const applicationData = mockApplicationData({
      openAiClientFactory: () => client,
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

    const url = request.url

    expect(url).toBe('https://example.com/api/v1/chat/completions')
  })

  it('when the api call throws a connection error, reports failure and exposes the error', async () => {
    const client = {
      chat: {
        completions: {
          create: () =>
            Promise.reject(new APIConnectionError({ message: 'down' })),
        },
      },
    } as unknown as OpenAI
    const applicationData = mockApplicationData({
      openAiClientFactory: () => client,
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
    const client = {
      chat: {
        completions: {
          create: () =>
            Promise.reject(
              new AuthenticationError(
                401,
                { message: 'bad key' },
                'bad key',
                new Headers(),
              ),
            ),
        },
      },
    } as unknown as OpenAI
    const applicationData = mockApplicationData({
      openAiClientFactory: () => client,
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
    const captured: OpenAiClientOptions[] = []
    const client = {
      chat: {
        completions: { create: () => Promise.resolve({ choices: [] }) },
      },
    } as unknown as OpenAI
    const applicationData = mockApplicationData({
      openAiClientFactory: (options) => {
        captured.push(options)
        return client
      },
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

    expect(captured[0].apiKey).toBe('test-key')
    expect(captured[0].baseURL).toBe('https://example.com/api/v1')
  })

  it('when the endpoint has no api key, constructs the client with the placeholder', async () => {
    const captured: OpenAiClientOptions[] = []
    const client = {
      chat: {
        completions: { create: () => Promise.resolve({ choices: [] }) },
      },
    } as unknown as OpenAI
    const applicationData = mockApplicationData({
      openAiClientFactory: (options) => {
        captured.push(options)
        return client
      },
    })
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

    expect(captured[0].apiKey).toBe('crow-no-api-key')
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

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { OpenAiRequest } from '../../../src/model-requests/framework/openai-request.ts'
import { ModelApiRequest } from '../../../src/model-requests/framework/model-api-request.ts'
import type { ModelMessages } from '../../../src/model-requests/types.ts'
import pino from 'pino'
import { createTestDatabase } from '../../support/test-database.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockFetchError, mockFetchSuccess } from '../../support/mock-fetch.ts'

describe('ModelApiRequest', () => {
  it('when run is called, writes the request messages onto the class', async () => {
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
    const modelApiRequest = new class
      extends ModelApiRequest<string, string[]> {
      protected override logPrefix = 'Test request: '

      protected override errorResponse() {
        return []
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }({
      applicationData,
      operationArguments: { modelEndpoint, requestData: 'build a cli' },
    })

    await modelApiRequest.run()

    expect(modelApiRequest.messages).toEqual([
      { role: 'user', content: 'build a cli' },
    ])
  })

  it('when run succeeds, writes the api request and reports success', async () => {
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
    const modelApiRequest = new class
      extends ModelApiRequest<string, string[]> {
      protected override logPrefix = 'Test request: '

      protected override errorResponse() {
        return []
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }({
      applicationData,
      operationArguments: { modelEndpoint, requestData: 'build a cli' },
    })

    await modelApiRequest.run()

    expect(modelApiRequest.apiRequest).toBeInstanceOf(OpenAiRequest)
    expect(modelApiRequest.apiRequest.success()).toBe(true)
    expect(modelApiRequest.success()).toBe(true)
  })

  it('when the answer is valid json, returns the parsed response', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [{ message: { content: '["first goal"]' } }],
        usage: {
          completion_tokens: 3,
          cost: 0.25,
        },
      }),
    })
    const modelApiRequest = new class
      extends ModelApiRequest<string, string[]> {
      protected override logPrefix = 'Test request: '

      protected override errorResponse() {
        return []
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }({
      applicationData,
      operationArguments: { modelEndpoint, requestData: 'build a cli' },
    })

    await modelApiRequest.run()

    expect(modelApiRequest.result()).toEqual(['first goal'])
    expect(modelApiRequest.success()).toBe(true)
    expect(modelApiRequest.failureReason()).toBe('')
    expect(modelApiRequest.metaData()).toEqual({
      cost: 0.25,
      requestDuration: expect.any(Number),
      tokenEffort: 3,
    })
  })

  it('when the answer is not valid json, returns the error response and records invalid-json', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [{ message: { content: 'not json' } }],
        usage: { completion_tokens: 1 },
      }),
    })
    const modelApiRequest = new class
      extends ModelApiRequest<string, string[]> {
      protected override logPrefix = 'Test request: '

      protected override errorResponse() {
        return []
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }({
      applicationData,
      operationArguments: { modelEndpoint, requestData: 'build a cli' },
    })

    await modelApiRequest.run()

    expect(modelApiRequest.result()).toEqual([])
    expect(modelApiRequest.success()).toBe(false)
    expect(modelApiRequest.failureReason()).toBe('invalid-json')
  })

  it('when the subclass rejects the response shape, returns the error response and records invalid-schema', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [{ message: { content: '["unexpected"]' } }],
        usage: { completion_tokens: 1 },
      }),
    })
    const modelApiRequest = new class
      extends ModelApiRequest<string, string[]> {
      protected override logPrefix = 'Test request: '

      protected override errorResponse() {
        return []
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }

      protected override validateResponse() {
        return false
      }
    }({
      applicationData,
      operationArguments: { modelEndpoint, requestData: 'build a cli' },
    })

    await modelApiRequest.run()

    expect(modelApiRequest.result()).toEqual([])
    expect(modelApiRequest.success()).toBe(false)
    expect(modelApiRequest.failureReason()).toBe('invalid-schema')
  })

  it('when a json api call fails, returns an empty array', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchError(500),
    })
    const modelApiRequest = new class
      extends ModelApiRequest<string, string[]> {
      protected override logPrefix = 'Test request: '

      protected override errorResponse() {
        return []
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }({
      applicationData,
      operationArguments: { modelEndpoint, requestData: 'build a cli' },
    })

    await modelApiRequest.run()

    expect(modelApiRequest.result()).toEqual([])
    expect(modelApiRequest.success()).toBe(false)
    expect(modelApiRequest.failureReason()).toBe('api-error')
  })

  it('when an api call fails without an api token, creates a provider availability record', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: '',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      database,
      fetch: mockFetchError(401),
    })
    const modelApiRequest = new class extends ModelApiRequest<string, string> {
      protected override logPrefix = 'Test request: '

      protected override errorResponse() {
        return ''
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }({
      applicationData,
      operationArguments: { modelEndpoint, requestData: 'build a cli' },
    })

    await modelApiRequest.run()

    const rows = await database('provider_availabilities')
    expect(rows).toHaveLength(1)
    expect(rows[0].provider_id).toBe(1)
    expect(rows[0].reason).toBe('no-api-key')
    await database.destroy()
  })

  it('when an api call fails with an api token, does not create a provider availability record', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      database,
      fetch: mockFetchError(500),
    })
    const modelApiRequest = new class extends ModelApiRequest<string, string> {
      protected override logPrefix = 'Test request: '

      protected override errorResponse() {
        return ''
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }({
      applicationData,
      operationArguments: { modelEndpoint, requestData: 'build a cli' },
    })

    await modelApiRequest.run()

    const rows = await database('provider_availabilities')
    expect(rows).toHaveLength(0)
    await database.destroy()
  })
})

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { FetchRequest } from '../../../src/model-requests/framework/fetch-request.ts'
import { ModelApiRequest } from '../../../src/model-requests/framework/model-api-request.ts'
import type { ModelMessages } from '../../../src/model-requests/types.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockFetchError, mockFetchSuccess } from '../../support/mock-fetch.ts'

describe('ModelApiRequest', () => {
  it('when run is called, writes the request messages onto the class', async () => {
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
    const modelApiRequest = new class
      extends ModelApiRequest<string, string[]> {
      protected parseAsJson = false

      protected override jsonErrorResponse() {
        return []
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }(modelEndpoint, applicationData, 'build a cli')

    await modelApiRequest.run()

    expect(modelApiRequest.messages).toEqual([
      { role: 'user', content: 'build a cli' },
    ])
  })

  it('when run is called, writes the request object onto the class', async () => {
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
    const modelApiRequest = new class
      extends ModelApiRequest<string, string[]> {
      protected parseAsJson = false

      protected override jsonErrorResponse() {
        return []
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }(modelEndpoint, applicationData, 'build a cli')

    await modelApiRequest.run()

    expect(modelApiRequest.requestObject).toBeInstanceOf(Request)
    expect(modelApiRequest.requestObject.headers.get('authorization')).toBe(
      'Bearer test-key',
    )
  })

  it('when run has not been called, reports failure', () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
    }
    const applicationData = mockApplicationData()
    const modelApiRequest = new class
      extends ModelApiRequest<string, string[]> {
      protected parseAsJson = false

      protected override jsonErrorResponse() {
        return []
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }(modelEndpoint, applicationData, 'build a cli')

    const succeeded = modelApiRequest.success()

    expect(succeeded).toBe(false)
  })

  it('when run succeeds, writes the api request and reports success', async () => {
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
    const modelApiRequest = new class
      extends ModelApiRequest<string, string[]> {
      protected parseAsJson = false

      protected override jsonErrorResponse() {
        return []
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }(modelEndpoint, applicationData, 'build a cli')

    await modelApiRequest.run()

    expect(modelApiRequest.apiRequest).toBeInstanceOf(FetchRequest)
    expect(modelApiRequest.apiRequest.success()).toBe(true)
    expect(modelApiRequest.success()).toBe(true)
  })

  it('when parseAsJson is false, returns the raw response', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
    }
    const applicationData = mockApplicationData({
      fetchClient: mockFetchSuccess({
        choices: [{ message: { content: 'raw response' } }],
      }),
    })
    const modelApiRequest = new class extends ModelApiRequest<string, string> {
      protected parseAsJson = false

      protected override jsonErrorResponse() {
        return ''
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }(modelEndpoint, applicationData, 'build a cli')

    const response = await modelApiRequest.run()

    expect(response).toBe('raw response')
  })

  it('when parseAsJson is true, returns the parsed response', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
    }
    const applicationData = mockApplicationData({
      fetchClient: mockFetchSuccess({
        choices: [{ message: { content: '["first goal"]' } }],
        usage: {
          completion_tokens: 3,
          cost: 0.25,
        },
      }),
    })
    const modelApiRequest = new class
      extends ModelApiRequest<string, string[]> {
      protected parseAsJson = true

      protected override jsonErrorResponse() {
        return []
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }(modelEndpoint, applicationData, 'build a cli')

    const response = await modelApiRequest.run()

    expect(response).toEqual(['first goal'])
    expect(modelApiRequest.metaData()).toEqual({
      cost: 0.25,
      requestDuration: expect.any(Number),
      tokenEffort: 3,
    })
  })

  it('when a raw api call fails, returns an empty string', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
    }
    const applicationData = mockApplicationData({
      fetchClient: mockFetchError(500),
    })
    const modelApiRequest = new class extends ModelApiRequest<string, string> {
      protected parseAsJson = false

      protected override jsonErrorResponse() {
        return ''
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }(modelEndpoint, applicationData, 'build a cli')

    const response = await modelApiRequest.run()

    expect(response).toBe('')
    expect(modelApiRequest.success()).toBe(false)
  })

  it('when a json api call fails, returns an empty array', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
    }
    const applicationData = mockApplicationData({
      fetchClient: mockFetchError(500),
    })
    const modelApiRequest = new class
      extends ModelApiRequest<string, string[]> {
      protected parseAsJson = true

      protected override jsonErrorResponse() {
        return []
      }

      protected getMessages(): ModelMessages[] {
        return [{ role: 'user', content: this.requestData }]
      }
    }(modelEndpoint, applicationData, 'build a cli')

    const response = await modelApiRequest.run()

    expect(response).toEqual([])
  })
})

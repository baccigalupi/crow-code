import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { OpenAiRequest } from '../../../src/model-requests/framework/openai-request.ts'
import { RequestParser } from '../../../src/model-requests/framework/request-parser.ts'
import { ModelAnswer } from '../../../src/model-requests/framework/model-answer.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockFetchError, mockFetchSuccess } from '../../support/mock-fetch.ts'

describe('RequestParser', () => {
  it('when the api request failed, records api-error', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({ fetch: mockFetchError(500) })
    const apiRequest = new OpenAiRequest({
      applicationData,
      operationArguments: { modelEndpoint, messages: [] },
    })
    await apiRequest.run()
    const parser = new RequestParser<string[]>(apiRequest, () => true)

    const result = await parser.run()

    expect(result).toBeUndefined()
    expect(parser.succeeded).toBe(false)
    expect(parser.reason).toBe('api-error')
  })

  it('when the answer is not valid json, records invalid-json', async () => {
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
    const apiRequest = new OpenAiRequest({
      applicationData,
      operationArguments: { modelEndpoint, messages: [] },
    })
    await apiRequest.run()
    const parser = new RequestParser<string[]>(apiRequest, () => true)

    const result = await parser.run()

    expect(result).toBeUndefined()
    expect(parser.succeeded).toBe(false)
    expect(parser.reason).toBe('invalid-json')
  })

  it('when the schema validator rejects the response, records invalid-schema', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [{ message: { content: '{"unexpected": 1}' } }],
        usage: { completion_tokens: 1 },
      }),
    })
    const apiRequest = new OpenAiRequest({
      applicationData,
      operationArguments: { modelEndpoint, messages: [] },
    })
    await apiRequest.run()
    const parser = new RequestParser<string[]>(apiRequest, () => false)

    const result = await parser.run()

    expect(result).toBeUndefined()
    expect(parser.succeeded).toBe(false)
    expect(parser.reason).toBe('invalid-schema')
  })

  it('when the answer is valid, returns the parsed response and reports success', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [{ message: { content: '["first goal"]' } }],
        usage: { completion_tokens: 3 },
      }),
    })
    const apiRequest = new OpenAiRequest({
      applicationData,
      operationArguments: { modelEndpoint, messages: [] },
    })
    await apiRequest.run()
    const parser = new RequestParser<string[]>(apiRequest, () => true)

    const result = await parser.run()

    expect(result).toEqual(['first goal'])
    expect(parser.succeeded).toBe(true)
    expect(parser.reason).toBe('')
    expect(parser.parsedResponse).toEqual(['first goal'])
    expect(parser.answer).toBeInstanceOf(ModelAnswer)
  })
})

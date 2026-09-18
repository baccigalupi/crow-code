import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { modelRequest } from '../../src/plan/model-request.ts'

describe('modelRequest', () => {
  it('when given an endpoint and messages, returns a POST request to the chat completions endpoint', () => {
    const modelEndpoint = {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-key',
      model: 'qwen3-coder:30b',
    }
    const messages = [
      { role: 'system', content: 'you extract goals' },
      { role: 'user', content: 'build me a cli' },
    ]

    const request = modelRequest(modelEndpoint, messages)

    expect(request.method).toBe('POST')
    expect(request.url).toBe('https://openrouter.ai/api/v1/chat/completions')
  })

  it('when building the request, includes the authorization and content type headers', () => {
    const modelEndpoint = {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-key',
      model: 'qwen3-coder:30b',
    }
    const messages = [
      { role: 'system', content: 'you extract goals' },
      { role: 'user', content: 'build me a cli' },
    ]

    const request = modelRequest(modelEndpoint, messages)

    expect(request.headers.get('authorization')).toBe('Bearer test-key')
    expect(request.headers.get('content-type')).toBe('application/json')
  })

  it('when building the request, serializes the model and messages in the body', async () => {
    const modelEndpoint = {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-key',
      model: 'qwen3-coder:30b',
    }
    const messages = [
      { role: 'system', content: 'you extract goals' },
      { role: 'user', content: 'build me a cli' },
    ]

    const request = modelRequest(modelEndpoint, messages)

    const body = await request.json()
    expect(body.model).toBe('qwen3-coder:30b')
    expect(body.messages).toEqual(messages)
  })
})

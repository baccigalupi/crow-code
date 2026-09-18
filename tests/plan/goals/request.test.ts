import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'
import { requestGoals } from '../../../src/plan/goals/request.ts'
import pino from 'pino'

const logger = pino({ enabled: false })

describe('requestGoals', () => {
  it('when the response contains a goals array, returns the goals', async () => {
    const modelEndpoint = {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-key',
      model: 'qwen3-coder:30b',
    }
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: '["ship the CLI", "write tests"]' } }],
    })

    const goals = await requestGoals(
      modelEndpoint,
      'build me a cli',
      logger,
      fetchMock,
    )

    expect(goals).toEqual(['ship the CLI', 'write tests'])
  })

  it('when requested, posts the model and messages with authorization', async () => {
    const modelEndpoint = {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-key',
      model: 'qwen3-coder:30b',
    }
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: '[]' } }],
    })

    await requestGoals(modelEndpoint, 'build me a cli', logger, fetchMock)

    const request = fetchMock.calls[0] as Request
    expect(request.method).toBe('POST')
    expect(request.url).toBe('https://openrouter.ai/api/v1/chat/completions')
    expect(request.headers.get('authorization')).toBe('Bearer test-key')
    const body = await request.json()
    expect(body.model).toBe('qwen3-coder:30b')
    expect(body.messages[0].role).toBe('system')
    expect(body.messages[1]).toEqual({
      role: 'user',
      content: 'build me a cli',
    })
  })

  it('when the response is not ok, returns an empty list', async () => {
    const modelEndpoint = {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-key',
      model: 'qwen3-coder:30b',
    }
    const fetchMock = mockFetchError(500)

    const goals = await requestGoals(
      modelEndpoint,
      'build me a cli',
      logger,
      fetchMock,
    )

    expect(goals).toEqual([])
  })

  it('when the fetch rejects, returns an empty list', async () => {
    const modelEndpoint = {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-key',
      model: 'qwen3-coder:30b',
    }
    const fetchMock = mockFetchRejected('network down')

    const goals = await requestGoals(
      modelEndpoint,
      'build me a cli',
      logger,
      fetchMock,
    )

    expect(goals).toEqual([])
  })

  it('when the content is not a goals array, returns an empty list', async () => {
    const modelEndpoint = {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-key',
      model: 'qwen3-coder:30b',
    }
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: 'not json' } }],
    })

    const goals = await requestGoals(
      modelEndpoint,
      'build me a cli',
      logger,
      fetchMock,
    )

    expect(goals).toEqual([])
  })

  it('when the response has no choices, returns an empty list', async () => {
    const modelEndpoint = {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-key',
      model: 'qwen3-coder:30b',
    }
    const fetchMock = mockFetchSuccess({})

    const goals = await requestGoals(
      modelEndpoint,
      'build me a cli',
      logger,
      fetchMock,
    )

    expect(goals).toEqual([])
  })

  it('when choices is empty, returns an empty list', async () => {
    const modelEndpoint = {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-key',
      model: 'qwen3-coder:30b',
    }
    const fetchMock = mockFetchSuccess({ choices: [] })

    const goals = await requestGoals(
      modelEndpoint,
      'build me a cli',
      logger,
      fetchMock,
    )

    expect(goals).toEqual([])
  })

  it('when the first choice has no message, returns an empty list', async () => {
    const modelEndpoint = {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-key',
      model: 'qwen3-coder:30b',
    }
    const fetchMock = mockFetchSuccess({ choices: [{}] })

    const goals = await requestGoals(
      modelEndpoint,
      'build me a cli',
      logger,
      fetchMock,
    )

    expect(goals).toEqual([])
  })

  it('when the message has no content, returns an empty list', async () => {
    const modelEndpoint = {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-key',
      model: 'qwen3-coder:30b',
    }
    const fetchMock = mockFetchSuccess({ choices: [{ message: {} }] })

    const goals = await requestGoals(
      modelEndpoint,
      'build me a cli',
      logger,
      fetchMock,
    )

    expect(goals).toEqual([])
  })
})

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  GetCommitMessage,
  getCommitMessage,
} from '../../src/model-requests/commit-message.ts'
import { createTestDatabase } from '../support/test-database.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'
import { mockFetchError, mockFetchSuccess } from '../support/mock-fetch.ts'

describe('commit-message', () => {
  it('when run is called, writes the commit message request messages onto the class', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [
          {
            message: {
              content: '{"subject":"Add login","body":"Adds the login form."}',
            },
          },
        ],
        usage: { completion_tokens: 1 },
      }),
    })
    const request = new GetCommitMessage(modelEndpoint, applicationData, {
      goal: 'add login',
      changes: [{ path: 'src/a.ts', diff: 'diff --git a/src/a.ts b/src/a.ts' }],
      recentSubjects: ['Fix tests'],
    })

    await request.run()

    expect(request.messages[0].role).toBe('system')
    expect(request.messages[1].role).toBe('user')
    expect(request.messages[1].content).toContain('add login')
    expect(request.result()).toEqual({
      subject: 'Add login',
      body: 'Adds the login form.',
    })
  })

  it('when the response is not a commit message object, returns an empty commit message and records invalid-schema', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [
          {
            message: {
              content: '{"subject": 42}',
            },
          },
        ],
        usage: { completion_tokens: 1 },
      }),
    })
    const request = new GetCommitMessage(modelEndpoint, applicationData, {
      goal: 'add login',
      changes: [],
      recentSubjects: [],
    })

    await request.run()

    expect(request.result()).toEqual({ subject: '', body: '' })
    expect(request.success()).toBe(false)
    expect(request.failureReason()).toBe('invalid-schema')
  })

  it('when the body is empty, returns an empty commit message and records invalid-schema', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [
          {
            message: {
              content: '{"subject":"Add login","body":""}',
            },
          },
        ],
        usage: { completion_tokens: 1 },
      }),
    })
    const request = new GetCommitMessage(modelEndpoint, applicationData, {
      goal: 'add login',
      changes: [],
      recentSubjects: [],
    })

    await request.run()

    expect(request.result()).toEqual({ subject: '', body: '' })
    expect(request.success()).toBe(false)
    expect(request.failureReason()).toBe('invalid-schema')
  })

  it('when the subject is blank, returns an empty commit message and records invalid-schema', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [
          {
            message: {
              content: '{"subject":"  ","body":"Adds the login form."}',
            },
          },
        ],
        usage: { completion_tokens: 1 },
      }),
    })
    const request = new GetCommitMessage(modelEndpoint, applicationData, {
      goal: 'add login',
      changes: [],
      recentSubjects: [],
    })

    await request.run()

    expect(request.result()).toEqual({ subject: '', body: '' })
    expect(request.success()).toBe(false)
    expect(request.failureReason()).toBe('invalid-schema')
  })

  it('when a field is not a string, returns an empty commit message and records invalid-schema', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [
          {
            message: {
              content: '{"subject":42,"body":"Adds the login form."}',
            },
          },
        ],
        usage: { completion_tokens: 1 },
      }),
    })
    const request = new GetCommitMessage(modelEndpoint, applicationData, {
      goal: 'add login',
      changes: [],
      recentSubjects: [],
    })

    await request.run()

    expect(request.result()).toEqual({ subject: '', body: '' })
    expect(request.success()).toBe(false)
    expect(request.failureReason()).toBe('invalid-schema')
  })

  it('when the response is not an object, returns an empty commit message and records invalid-schema', async () => {
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      fetch: mockFetchSuccess({
        choices: [
          {
            message: {
              content: '42',
            },
          },
        ],
        usage: { completion_tokens: 1 },
      }),
    })
    const request = new GetCommitMessage(modelEndpoint, applicationData, {
      goal: 'add login',
      changes: [],
      recentSubjects: [],
    })

    await request.run()

    expect(request.result()).toEqual({ subject: '', body: '' })
    expect(request.success()).toBe(false)
    expect(request.failureReason()).toBe('invalid-schema')
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
      cost_input: 1,
      cost_output: 1,
      dynamic_delegation: false,
      modality: 'text->text',
      supported_parameters: '[]',
      supports_reasoning: false,
      can_disable_reasoning: false,
      reasoning_options: '{}',
    })
    const fetch = mockFetchError(500)
    const applicationData = mockApplicationData({ database, logger, fetch })

    const runner = await getCommitMessage(applicationData, {
      goal: 'add login',
      changes: [],
      recentSubjects: [],
    }).run()

    expect(runner.success()).toBe(false)
    expect(runner.result()).toBeUndefined()
    await database.destroy()
  })

  it('when the api call succeeds, the runner returns the commit message', async () => {
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
      cost_input: 1,
      cost_output: 1,
      dynamic_delegation: false,
      modality: 'text->text',
      supported_parameters: '[]',
      supports_reasoning: false,
      can_disable_reasoning: false,
      reasoning_options: '{}',
    })
    const fetch = mockFetchSuccess({
      choices: [
        {
          message: {
            content: '{"subject":"Add login","body":"Adds the login form."}',
          },
        },
      ],
      usage: { completion_tokens: 1 },
    })
    const applicationData = mockApplicationData({ database, logger, fetch })

    const runner = await getCommitMessage(applicationData, {
      goal: 'add login',
      changes: [],
      recentSubjects: [],
    }).run()

    expect(runner.success()).toBe(true)
    expect(runner.result()).toEqual({
      subject: 'Add login',
      body: 'Adds the login form.',
    })
    await database.destroy()
  })
})

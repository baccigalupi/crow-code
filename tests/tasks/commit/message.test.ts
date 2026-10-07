import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import pino from 'pino'
import { commitMessage } from '../../../src/tasks/commit/message.ts'
import { createTestDatabase } from '../../support/test-database.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../support/mock-deno-command.ts'
import { mockFetchError, mockFetchSuccess } from '../../support/mock-fetch.ts'

describe('commitMessage', () => {
  it('when the model answers, returns the commit message', async () => {
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
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      database,
      logger,
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
      denoCommand: mockDenoCommand({
        commandSpy,
        stdout: 'Fix tests\n',
      }),
    })

    const operation = await commitMessage({
      applicationData,
      operationArguments: {
        goal: 'add login',
        changes: [{
          path: 'src/a.ts',
          diff: 'diff --git a/src/a.ts b/src/a.ts',
        }],
      },
    }).run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['log', '--format=%s', '-n', '10'] }],
    })
    expect(operation.result()).toEqual({
      subject: 'Add login',
      body: 'Adds the login form.',
    })
    await database.destroy()
  })

  it('when git log fails, still returns the message', async () => {
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
    const applicationData = mockApplicationData({
      database,
      logger,
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
      denoCommand: mockDenoCommand({
        stdout: [new Error('no commits')],
      }),
    })

    const operation = await commitMessage({
      applicationData,
      operationArguments: {
        goal: 'add login',
        changes: [{
          path: 'src/a.ts',
          diff: 'diff --git a/src/a.ts b/src/a.ts',
        }],
      },
    }).run()

    expect(operation.result()).toEqual({
      subject: 'Add login',
      body: 'Adds the login form.',
    })
    await database.destroy()
  })

  it('when every model fails, returns undefined', async () => {
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
    const applicationData = mockApplicationData({
      database,
      logger,
      fetch: mockFetchError(500),
      denoCommand: mockDenoCommand({ stdout: 'Fix tests\n' }),
    })

    const operation = await commitMessage({
      applicationData,
      operationArguments: {
        goal: 'add login',
        changes: [{
          path: 'src/a.ts',
          diff: 'diff --git a/src/a.ts b/src/a.ts',
        }],
      },
    }).run()

    expect(operation.result()).toBeUndefined()
    await database.destroy()
  })

  it('when no models are registered, returns undefined without calling fetch', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const fetch = mockFetchSuccess({})
    const applicationData = mockApplicationData({
      database,
      logger,
      fetch,
      denoCommand: mockDenoCommand({ stdout: 'Fix tests\n' }),
    })

    const operation = await commitMessage({
      applicationData,
      operationArguments: {
        goal: 'add login',
        changes: [{
          path: 'src/a.ts',
          diff: 'diff --git a/src/a.ts b/src/a.ts',
        }],
      },
    }).run()

    expect(operation.result()).toBeUndefined()
    expect(fetch.calls.length).toBe(0)
    await database.destroy()
  })
})

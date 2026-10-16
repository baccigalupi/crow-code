import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import { commitMessage } from '../../../src/tasks/commit/message.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockCommand } from '../../support/mock-command.ts'
import { mockFetchSuccess } from '../../support/mock-fetch.ts'
import {
  mockOpenAiClient,
  mockOpenAiClientError,
  mockOpenAiClientWithFetch,
} from '../../support/mock-openai-client.ts'

describe('commitMessage', () => {
  it('when the model answers, returns the commit message', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClient(
        '{"subject":"Add login","body":"Adds the login form."}',
      ),
      command: mockCommand({
        commandSpy,
        stdout: 'Fix tests\n',
      }),
    })
    const database = await applicationData.database()
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
  })

  it('when git log fails, still returns the message', async () => {
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClient(
        '{"subject":"Add login","body":"Adds the login form."}',
      ),
      command: mockCommand({
        stdout: [new Error('no commits')],
      }),
    })
    const database = await applicationData.database()
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
  })

  it('when every model fails, returns undefined', async () => {
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClientError(500),
      command: mockCommand({ stdout: 'Fix tests\n' }),
    })
    const database = await applicationData.database()
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
  })

  it('when no models are registered, returns undefined without calling fetch', async () => {
    const fetch = mockFetchSuccess({})
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClientWithFetch(fetch),
      command: mockCommand({ stdout: 'Fix tests\n' }),
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
  })
})

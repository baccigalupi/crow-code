import { describe, expect, it, mock, spyOn } from 'bun:test'
import { commit } from '../../src/tasks/commit.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'
import { mockCommand } from '../support/mock-command.ts'
import { mockFetchSuccess } from '../support/mock-fetch.ts'
import {
  mockOpenAiClient,
  mockOpenAiClientError,
  mockOpenAiClientWithFetch,
} from '../support/mock-openai-client.ts'

describe('commit', () => {
  it('when files changed, collects diffs, requests a message, stages and commits', async () => {
    const commandSpy = mock()
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
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClientWithFetch(fetch),
      command: mockCommand({
        commandSpy,
        stdout: [
          'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1 +1 @@\n-old\n+new\n',
          ' M src/a.ts\n?? src/b.ts\n',
          'diff --git a/src/b.ts b/src/b.ts\nnew file mode 100644\n--- /dev/null\n+++ b/src/b.ts\n@@ -0,0 +1 @@\n+beta\n',
          'Fix tests\n',
          '',
          'committed',
        ],
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
    const task = commit({
      applicationData,
      operationArguments: {
        goal: 'add login',
        files: ['src/a.ts', 'src/b.ts'],
      },
    })

    await task.run()

    expect(commandSpy).toHaveBeenNthCalledWith(
      1,
      'git',
      expect.objectContaining({
        args: ['diff', 'HEAD', '--', 'src/a.ts', 'src/b.ts'],
      }),
    )
    expect(commandSpy).toHaveBeenNthCalledWith(
      2,
      'git',
      expect.objectContaining({ args: ['status', '--porcelain', '-uall'] }),
    )
    expect(commandSpy).toHaveBeenNthCalledWith(
      3,
      'git',
      expect.objectContaining({
        args: ['diff', '--no-index', '/dev/null', 'src/b.ts'],
      }),
    )
    expect(commandSpy).toHaveBeenNthCalledWith(
      4,
      'git',
      expect.objectContaining({ args: ['log', '--format=%s', '-n', '10'] }),
    )
    expect(commandSpy).toHaveBeenNthCalledWith(
      5,
      'git',
      expect.objectContaining({
        args: ['add', '--', 'src/a.ts', 'src/b.ts'],
      }),
    )
    expect(commandSpy).toHaveBeenNthCalledWith(
      6,
      'git',
      expect.objectContaining({
        args: [
          'commit',
          '-m',
          'Add login\n\nAdds the login form.',
          '--',
          'src/a.ts',
          'src/b.ts',
        ],
      }),
    )
    expect(fetch.calls.length).toBe(1)
    expect(task.success()).toBe(true)
    expect(task.result()).toEqual({
      subject: 'Add login',
      body: 'Adds the login form.',
    })
  })

  it('when the diff collection fails, stops without the model or staging', async () => {
    const commandSpy = mock()
    const fetch = mockFetchSuccess({})
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClientWithFetch(fetch),
      command: mockCommand({ commandSpy, success: false }),
    })
    const task = commit({
      applicationData,
      operationArguments: { goal: 'add login', files: ['src/a.ts'] },
    })

    await task.run()

    expect(commandSpy.mock.calls.length).toBe(1)
    expect(fetch.calls.length).toBe(0)
    expect(task.success()).toBe(false)
    expect(task.result()).toEqual({ subject: '', body: '' })
  })

  it('when nothing changed, fails without the model and logs', async () => {
    const commandSpy = mock()
    const fetch = mockFetchSuccess({})
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClientWithFetch(fetch),
      command: mockCommand({ commandSpy, stdout: ['', ''] }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')
    const task = commit({
      applicationData,
      operationArguments: { goal: 'add login', files: ['src/a.ts'] },
    })

    await task.run()

    expect(task.success()).toBe(false)
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Commit: no changes to commit',
    )
    expect(fetch.calls.length).toBe(0)
  })

  it('when no files are given, collects all changes, stages everything and commits', async () => {
    const commandSpy = mock()
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
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClientWithFetch(fetch),
      command: mockCommand({
        commandSpy,
        stdout: [
          'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1 +1 @@\n-old\n+new\n',
          ' M src/a.ts\n?? src/b.ts\n',
          'diff --git a/src/b.ts b/src/b.ts\nnew file mode 100644\n--- /dev/null\n+++ b/src/b.ts\n@@ -0,0 +1 @@\n+beta\n',
          'Fix tests\n',
          '',
          'committed',
        ],
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
    const task = commit({
      applicationData,
      operationArguments: { goal: 'add login', files: [] },
    })

    await task.run()

    expect(commandSpy).toHaveBeenNthCalledWith(
      1,
      'git',
      expect.objectContaining({ args: ['diff', 'HEAD'] }),
    )
    expect(commandSpy).toHaveBeenNthCalledWith(
      2,
      'git',
      expect.objectContaining({ args: ['status', '--porcelain', '-uall'] }),
    )
    expect(commandSpy).toHaveBeenNthCalledWith(
      3,
      'git',
      expect.objectContaining({
        args: ['diff', '--no-index', '/dev/null', 'src/b.ts'],
      }),
    )
    expect(commandSpy).toHaveBeenNthCalledWith(
      5,
      'git',
      expect.objectContaining({ args: ['add', '--all'] }),
    )
    expect(task.success()).toBe(true)
    expect(task.result()).toEqual({
      subject: 'Add login',
      body: 'Adds the login form.',
    })
  })

  it('when the model request fails, does not stage or commit', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClientError(500),
      command: mockCommand({
        commandSpy,
        stdout: [
          'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1 +1 @@\n-old\n+new\n',
          '',
          'Fix tests\n',
        ],
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
    const task = commit({
      applicationData,
      operationArguments: { goal: 'add login', files: ['src/a.ts'] },
    })

    await task.run()

    expect(commandSpy.mock.calls.length).toBe(3)
    expect(task.success()).toBe(false)
  })

  it('when staging fails, reports failure', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClient(
        '{"subject":"Add login","body":"Adds the login form."}',
      ),
      command: mockCommand({
        commandSpy,
        stdout: [
          'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1 +1 @@\n-old\n+new\n',
          '',
          'Fix tests\n',
          new Error('add failed'),
        ],
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
    const task = commit({
      applicationData,
      operationArguments: { goal: 'add login', files: ['src/a.ts'] },
    })

    await task.run()

    expect(commandSpy.mock.calls.length).toBe(4)
    expect(task.success()).toBe(false)
  })

  it('when the commit fails, reports failure', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClient(
        '{"subject":"Add login","body":"Adds the login form."}',
      ),
      command: mockCommand({
        commandSpy,
        stdout: [
          'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1 +1 @@\n-old\n+new\n',
          '',
          'Fix tests\n',
          '',
          new Error('commit failed'),
        ],
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
    const task = commit({
      applicationData,
      operationArguments: { goal: 'add login', files: ['src/a.ts'] },
    })

    await task.run()

    expect(commandSpy.mock.calls.length).toBe(5)
    expect(task.success()).toBe(false)
  })

  it('when git log fails, still stages and commits', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      chatClient: mockOpenAiClient(
        '{"subject":"Add login","body":"Adds the login form."}',
      ),
      command: mockCommand({
        commandSpy,
        stdout: [
          'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1 +1 @@\n-old\n+new\n',
          '?? src/b.ts\n',
          'diff --git a/src/b.ts b/src/b.ts\nnew file mode 100644\n--- /dev/null\n+++ b/src/b.ts\n@@ -0,0 +1 @@\n+beta\n',
          new Error('no commits'),
          '',
          'committed',
        ],
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
    const task = commit({
      applicationData,
      operationArguments: {
        goal: 'add login',
        files: ['src/a.ts', 'src/b.ts'],
      },
    })

    await task.run()

    expect(task.success()).toBe(true)
    expect(task.result()).toEqual({
      subject: 'Add login',
      body: 'Adds the login form.',
    })
  })
})

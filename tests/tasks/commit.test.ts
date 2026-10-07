import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import pino from 'pino'
import { commit } from '../../src/tasks/commit.ts'
import { createTestDatabase } from '../support/test-database.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'
import { mockDenoCommand } from '../support/mock-deno-command.ts'
import { mockFetchError, mockFetchSuccess } from '../support/mock-fetch.ts'

describe('commit', () => {
  it('when files changed, collects diffs, requests a message, stages and commits', async () => {
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
      database,
      logger,
      fetch,
      denoCommand: mockDenoCommand({
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
    const task = commit({
      applicationData,
      operationArguments: {
        goal: 'add login',
        files: ['src/a.ts', 'src/b.ts'],
      },
    })

    await task.run()

    assertSpyCall(commandSpy, 0, {
      args: [
        'git',
        { args: ['diff', 'HEAD', '--', 'src/a.ts', 'src/b.ts'] },
      ],
    })
    assertSpyCall(commandSpy, 1, {
      args: ['git', { args: ['status', '--porcelain', '-uall'] }],
    })
    assertSpyCall(commandSpy, 2, {
      args: ['git', { args: ['diff', '--no-index', '/dev/null', 'src/b.ts'] }],
    })
    assertSpyCall(commandSpy, 3, {
      args: ['git', { args: ['log', '--format=%s', '-n', '10'] }],
    })
    assertSpyCall(commandSpy, 4, {
      args: ['git', { args: ['add', '--', 'src/a.ts', 'src/b.ts'] }],
    })
    assertSpyCall(commandSpy, 5, {
      args: [
        'git',
        {
          args: [
            'commit',
            '-m',
            'Add login\n\nAdds the login form.',
            '--',
            'src/a.ts',
            'src/b.ts',
          ],
        },
      ],
    })
    expect(fetch.calls.length).toBe(1)
    expect(task.success()).toBe(true)
    expect(task.result()).toEqual({
      subject: 'Add login',
      body: 'Adds the login form.',
    })
    await database.destroy()
  })

  it('when the diff collection fails, stops without the model or staging', async () => {
    const commandSpy = spy()
    const fetch = mockFetchSuccess({})
    const applicationData = mockApplicationData({
      fetch,
      denoCommand: mockDenoCommand({ commandSpy, success: false }),
    })
    const task = commit({
      applicationData,
      operationArguments: { goal: 'add login', files: ['src/a.ts'] },
    })

    await task.run()

    expect(commandSpy.calls.length).toBe(2)
    expect(fetch.calls.length).toBe(0)
    expect(task.success()).toBe(false)
    expect(task.result()).toEqual({ subject: '', body: '' })
  })

  it('when nothing changed, fails without the model and logs', async () => {
    const commandSpy = spy()
    const fetch = mockFetchSuccess({})
    const applicationData = mockApplicationData({
      fetch,
      denoCommand: mockDenoCommand({ commandSpy, stdout: ['', ''] }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
    const task = commit({
      applicationData,
      operationArguments: { goal: 'add login', files: ['src/a.ts'] },
    })

    await task.run()

    expect(task.success()).toBe(false)
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Commit: no changes to commit',
    )
    expect(fetch.calls.length).toBe(0)
  })

  it('when no files are given, collects all changes, stages everything and commits', async () => {
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
      database,
      logger,
      fetch,
      denoCommand: mockDenoCommand({
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
    const task = commit({
      applicationData,
      operationArguments: { goal: 'add login', files: [] },
    })

    await task.run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['diff', 'HEAD'] }],
    })
    assertSpyCall(commandSpy, 1, {
      args: ['git', { args: ['status', '--porcelain', '-uall'] }],
    })
    assertSpyCall(commandSpy, 2, {
      args: ['git', { args: ['diff', '--no-index', '/dev/null', 'src/b.ts'] }],
    })
    assertSpyCall(commandSpy, 4, {
      args: ['git', { args: ['add', '--all'] }],
    })
    expect(task.success()).toBe(true)
    expect(task.result()).toEqual({
      subject: 'Add login',
      body: 'Adds the login form.',
    })
    await database.destroy()
  })

  it('when the model request fails, does not stage or commit', async () => {
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
      fetch: mockFetchError(500),
      denoCommand: mockDenoCommand({
        commandSpy,
        stdout: [
          'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1 +1 @@\n-old\n+new\n',
          '',
          'Fix tests\n',
        ],
      }),
    })
    const task = commit({
      applicationData,
      operationArguments: { goal: 'add login', files: ['src/a.ts'] },
    })

    await task.run()

    expect(commandSpy.calls.length).toBe(3)
    expect(task.success()).toBe(false)
    await database.destroy()
  })

  it('when staging fails, reports failure', async () => {
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
        stdout: [
          'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1 +1 @@\n-old\n+new\n',
          '',
          'Fix tests\n',
          new Error('add failed'),
        ],
      }),
    })
    const task = commit({
      applicationData,
      operationArguments: { goal: 'add login', files: ['src/a.ts'] },
    })

    await task.run()

    expect(commandSpy.calls.length).toBe(4)
    expect(task.success()).toBe(false)
    await database.destroy()
  })

  it('when the commit fails, reports failure', async () => {
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
        stdout: [
          'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1 +1 @@\n-old\n+new\n',
          '',
          'Fix tests\n',
          '',
          new Error('commit failed'),
        ],
      }),
    })
    const task = commit({
      applicationData,
      operationArguments: { goal: 'add login', files: ['src/a.ts'] },
    })

    await task.run()

    expect(commandSpy.calls.length).toBe(5)
    expect(task.success()).toBe(false)
    await database.destroy()
  })

  it('when git log fails, still stages and commits', async () => {
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
    await database.destroy()
  })
})

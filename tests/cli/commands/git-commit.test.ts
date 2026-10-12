import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { spy } from '@std/testing/mock'
import { command } from '../../../src/cli/commands/command.ts'
import { GitCommit } from '../../../src/cli/commands/git-commit.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../support/mock-deno-command.ts'
import { mockFetchSuccess } from '../../support/mock-fetch.ts'

describe('GitCommit', () => {
  it('when the command is git-commit, matches', () => {
    const applicationData = mockApplicationData({ args: ['git-commit'] })

    const gitCommit = command(GitCommit, applicationData)

    expect(gitCommit.isMatch()).toBe(true)
  })

  it('when the command is something else, does not match', () => {
    const applicationData = mockApplicationData({ args: ['add-provider'] })

    const gitCommit = command(GitCommit, applicationData)

    expect(gitCommit.isMatch()).toBe(false)
  })

  it('when --goal is missing, fails without running git or the model', async () => {
    const consoleLog = mock.fn()
    const consoleError = mock.fn()
    const commandSpy = spy()
    const fetch = mockFetchSuccess({})
    const applicationData = mockApplicationData({
      args: ['git-commit', 'src/a.ts'],
      consoleLog,
      consoleError,
      fetch,
      denoCommand: mockDenoCommand({ commandSpy }),
    })

    const gitCommit = command(GitCommit, applicationData)
    await gitCommit.run()
    gitCommit.reportFailure()

    expect(gitCommit.success()).toBe(false)
    expect(consoleError.mock.calls[0].arguments[0]).toBe(
      'Error: missing --goal=<goal> for git-commit',
    )
    expect(consoleLog.mock.calls).toHaveLength(0)
    expect(commandSpy.calls.length).toBe(0)
    expect(fetch.calls.length).toBe(0)
  })

  it('when a downstream operation fails, reports a brief error', async () => {
    const consoleLog = mock.fn()
    const consoleError = mock.fn()
    const applicationData = mockApplicationData({
      args: ['git-commit', '--goal=add login', 'src/a.ts'],
      consoleLog,
      consoleError,
      denoCommand: mockDenoCommand({ success: false }),
    })

    const gitCommit = command(GitCommit, applicationData)
    await gitCommit.run()
    gitCommit.reportFailure()

    expect(gitCommit.success()).toBe(false)
    expect(consoleError.mock.calls[0].arguments[0]).toBe(
      'Error: git tracked changes failed for git-commit',
    )
    expect(consoleLog.mock.calls).toHaveLength(0)
  })

  it('when run succeeds, prints the commit subject and stages the files', async () => {
    const consoleLog = mock.fn()
    const consoleError = mock.fn()
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      args: ['git-commit', '--goal=add login', 'src/a.ts'],
      consoleLog,
      consoleError,
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

    const gitCommit = command(GitCommit, applicationData)
    await gitCommit.run()

    expect(gitCommit.success()).toBe(true)
    expect(consoleLog.mock.calls[0].arguments[0]).toBe('Add login')
    expect(consoleError.mock.calls).toHaveLength(0)
    expect(commandSpy.calls[3].args[1].args).toEqual([
      'add',
      '--',
      'src/a.ts',
    ])
    await database.destroy()
  })
})

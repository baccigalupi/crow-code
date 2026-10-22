import { describe, expect, it, mock, spyOn } from 'bun:test'
import { GitReadOnlyPassthrough } from '../../../../src/tools/git/read-only/git-passthrough.ts'
import type { GitSubcommand } from '../../../../src/tools/types.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { mockCommand } from '../../../support/mock-command.ts'

describe('GitReadOnlyPassthrough', () => {
  it('when no subcommand is enabled, refuses log without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['log'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.success()).toBe(false)
    expect(passthrough.result()).toEqual({ stdout: '' })
    expect(passthrough.reason).toBe(
      'subcommand not allowed: log; allowed subcommands: none',
    )
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git read only passthrough: subcommand not allowed: log; allowed subcommands: none',
    )
  })

  it('when a flag is not enabled, refuses without running git', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: { '--oneline': 'switch' } },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', '--graph'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --graph; allowed flags for log: --oneline',
    )
  })

  it('when a subcommand is enabled, runs it with the safe prefix and returns stdout', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: {} },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'abc\n', commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][0]).toBe('git')
    expect(commandSpy.mock.calls[0][1].args).toEqual([
      '--no-pager',
      '-c',
      'core.fsmonitor=false',
      '-c',
      'core.hooksPath=/dev/null',
      '-c',
      'core.pager=cat',
      '-c',
      'diff.external=',
      '-c',
      'protocol.allow=never',
      '-c',
      'core.untrackedCache=false',
      'log',
    ])
    expect(commandSpy.mock.calls[0][1].env.GIT_PAGER).toBe('cat')
    expect(passthrough.result()).toEqual({ stdout: 'abc\n' })
  })

  it('when git fails, returns empty stdout and logs stderr', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: {} },
      }
    }
    const applicationData = mockApplicationData({
      command: mockCommand({
        success: false,
        code: 128,
        stderr: 'fatal: bad revision',
      }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(passthrough.result()).toEqual({ stdout: '' })
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git read only passthrough: fatal: bad revision',
    )
  })

  it('when git fails with empty stderr, the reason names the exit code and command', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: {} },
      }
    }
    const applicationData = mockApplicationData({
      command: mockCommand({ success: false, code: 1, stderr: '' }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log'] },
    })
    await passthrough.run()

    expect(passthrough.reason).toBe('git exited with code 1: log')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git read only passthrough: git exited with code 1: log',
    )
  })

  it('when git cannot be executed, logs the spawn error', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: {} },
      }
    }
    const applicationData = mockApplicationData({
      command: mockCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log'] },
    })
    await passthrough.run()

    expect(passthrough.reason).toBe(
      'No such file or directory (os error 2): git',
    )
  })
})

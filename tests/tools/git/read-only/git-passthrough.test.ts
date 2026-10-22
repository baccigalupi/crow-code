import { describe, expect, it, mock, spyOn } from 'bun:test'
import { GitReadOnlyPassthrough } from '../../../../src/tools/git/read-only/git-passthrough.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { mockCommand } from '../../../support/mock-command.ts'

describe('GitReadOnlyPassthrough', () => {
  it('when log is requested, runs git log with the safe prefix and returns stdout', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'abc\n', commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
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

  it('when show is requested, runs git show', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['show', '--stat', 'abc123'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-3)).toEqual([
      'show',
      '--stat',
      'abc123',
    ])
  })

  it('when diff is requested, runs git diff with its fixed flags', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['diff', 'a..b', '--', 'src/a.ts'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-6)).toEqual([
      'diff',
      '--no-ext-diff',
      '--no-textconv',
      'a..b',
      '--',
      'src/a.ts',
    ])
  })

  it('when blame is requested, runs git blame', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['blame', '--porcelain', '--', 'src/a.ts'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-4)).toEqual([
      'blame',
      '--porcelain',
      '--',
      'src/a.ts',
    ])
  })

  it('when push is requested, refuses listing the allowed subcommands', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['push'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'subcommand not allowed: push; allowed subcommands: blame, diff, log, show',
    )
  })

  it('when difftool is requested, refuses it', async () => {
    const applicationData = mockApplicationData({ command: mockCommand() })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['difftool'] },
    })
    await passthrough.run()

    expect(passthrough.reason).toBe(
      'subcommand not allowed: difftool; allowed subcommands: blame, diff, log, show',
    )
  })

  it('when no arguments are given, refuses with (none)', async () => {
    const applicationData = mockApplicationData({ command: mockCommand() })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: [] },
    })
    await passthrough.run()

    expect(passthrough.reason).toBe(
      'subcommand not allowed: (none); allowed subcommands: blame, diff, log, show',
    )
  })

  it('when the subcommand is an object prototype key, refuses it', async () => {
    const applicationData = mockApplicationData({ command: mockCommand() })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['constructor'] },
    })
    await passthrough.run()

    expect(passthrough.reason).toBe(
      'subcommand not allowed: constructor; allowed subcommands: blame, diff, log, show',
    )
  })

  it('when the first argument is a global option, refuses it as the subcommand', async () => {
    const applicationData = mockApplicationData({ command: mockCommand() })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['-C', '/tmp', 'log'] },
    })
    await passthrough.run()

    expect(passthrough.reason).toBe(
      'subcommand not allowed: -C; allowed subcommands: blame, diff, log, show',
    )
  })

  it('when the subcommand refuses a flag, does not run git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['log', '--output=f'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --output=f; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
    )
  })

  it('when a bare argument is outside permissions, refuses and logs it', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['log', '../x'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.success()).toBe(false)
    expect(passthrough.reason).toBe('path not allowed: ../x')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git read only passthrough: path not allowed: ../x',
    )
  })

  it('when revisions and an in-bounds pathspec are given, runs git with them', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: {
        args: ['log', 'HEAD~3', 'origin/main', '--', 'src/a.ts'],
      },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-5)).toEqual([
      'log',
      'HEAD~3',
      'origin/main',
      '--',
      'src/a.ts',
    ])
    expect(passthrough.success()).toBe(true)
  })

  it('when a dash-prefixed pathspec follows --, treats it as a path and runs git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['log', '--', '--evil'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(1)
    expect(passthrough.success()).toBe(true)
  })

  it('when a pathspec after -- is outside permissions, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['log', '--', '../x'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe('path not allowed: ../x')
  })

  it('when rev:path has an in-bounds path, runs git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['show', 'abc123:src/a.ts'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(1)
  })

  it('when rev:path escapes permissions, refuses naming the path', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['show', 'abc123:../x'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe('path not allowed: ../x')
  })

  it('when a path flag value is in bounds, runs git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['blame', '--contents=notes.txt', 'a.ts'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(1)
  })

  it('when a path flag value is outside permissions, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['blame', '--contents=../x', 'a.ts'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe('path not allowed: ../x')
  })

  it('when pathspec magic is given, refuses naming it', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['log', ':(top)x', '--', ':!foo'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe('path not allowed: :(top)x, :!foo')
  })

  it('when the index form :0:path is given, refuses it whole', async () => {
    const applicationData = mockApplicationData({ command: mockCommand() })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['log', ':0:src/a.ts'] },
    })
    await passthrough.run()

    expect(passthrough.reason).toBe('path not allowed: :0:src/a.ts')
  })

  it('when several paths are denied, names each once and omits allowed ones', async () => {
    const applicationData = mockApplicationData({ command: mockCommand() })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: {
        args: ['log', '../a', 'HEAD', '--', '../b', '../a'],
      },
    })
    await passthrough.run()

    expect(passthrough.reason).toBe('path not allowed: ../a, ../b')
  })

  it('when git fails, returns empty stdout and logs stderr', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        success: false,
        code: 128,
        stderr: 'fatal: bad revision',
      }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const passthrough = new GitReadOnlyPassthrough({
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
    const applicationData = mockApplicationData({
      command: mockCommand({ success: false, code: 1, stderr: '' }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const passthrough = new GitReadOnlyPassthrough({
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
    const applicationData = mockApplicationData({
      command: mockCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['log'] },
    })
    await passthrough.run()

    expect(passthrough.reason).toBe(
      'No such file or directory (os error 2): git',
    )
  })
})

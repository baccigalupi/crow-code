import { describe, expect, it, mock, spyOn } from 'bun:test'
import { GitReadOnlyPassthrough } from '../../../../src/tools/git/read-only/git-passthrough.ts'
import type { GitSubcommand } from '../../../../src/tools/types.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { mockCommand } from '../../../support/mock-command.ts'

describe('GitReadOnlyPassthrough', () => {
  it('when push is requested, refuses listing log as allowed', async () => {
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
      'subcommand not allowed: push; allowed subcommands: log',
    )
  })

  describe('log subcommand', () => {
    it('when log is given --oneline, -n and a pathspec, runs git with them', async () => {
      const commandSpy = mock()
      const applicationData = mockApplicationData({
        command: mockCommand({ commandSpy }),
      })

      const passthrough = new GitReadOnlyPassthrough({
        applicationData,
        operationArguments: {
          args: ['log', '--oneline', '-n', '5', '--', 'src/a.ts'],
        },
      })
      await passthrough.run()

      expect(commandSpy.mock.calls[0][1].args.slice(-6)).toEqual([
        'log',
        '--oneline',
        '-n',
        '5',
        '--',
        'src/a.ts',
      ])
      expect(passthrough.success()).toBe(true)
    })

    it('when log is given the arguments GitLogHistory builds, runs git with them', async () => {
      const commandSpy = mock()
      const applicationData = mockApplicationData({
        command: mockCommand({ commandSpy }),
      })

      const passthrough = new GitReadOnlyPassthrough({
        applicationData,
        operationArguments: {
          args: ['log', '--format=%H%x1f%an%x1f%aI%x1f%s', '-n', '20'],
        },
      })
      await passthrough.run()

      expect(commandSpy.mock.calls[0][1].args.slice(-4)).toEqual([
        'log',
        '--format=%H%x1f%an%x1f%aI%x1f%s',
        '-n',
        '20',
      ])
    })

    it('when log is given --stat, runs git', async () => {
      const commandSpy = mock()
      const applicationData = mockApplicationData({
        command: mockCommand({ commandSpy }),
      })

      const passthrough = new GitReadOnlyPassthrough({
        applicationData,
        operationArguments: { args: ['log', '--stat'] },
      })
      await passthrough.run()

      expect(passthrough.success()).toBe(true)
    })

    it('when log is given --name-only, runs git', async () => {
      const commandSpy = mock()
      const applicationData = mockApplicationData({
        command: mockCommand({ commandSpy }),
      })

      const passthrough = new GitReadOnlyPassthrough({
        applicationData,
        operationArguments: { args: ['log', '--name-only'] },
      })
      await passthrough.run()

      expect(passthrough.success()).toBe(true)
    })

    it('when log is given --name-status, runs git', async () => {
      const commandSpy = mock()
      const applicationData = mockApplicationData({
        command: mockCommand({ commandSpy }),
      })

      const passthrough = new GitReadOnlyPassthrough({
        applicationData,
        operationArguments: { args: ['log', '--name-status'] },
      })
      await passthrough.run()

      expect(passthrough.success()).toBe(true)
    })

    it('when log is given --follow, runs git', async () => {
      const commandSpy = mock()
      const applicationData = mockApplicationData({
        command: mockCommand({ commandSpy }),
      })

      const passthrough = new GitReadOnlyPassthrough({
        applicationData,
        operationArguments: { args: ['log', '--follow'] },
      })
      await passthrough.run()

      expect(passthrough.success()).toBe(true)
    })

    it('when log is given --no-merges, runs git', async () => {
      const commandSpy = mock()
      const applicationData = mockApplicationData({
        command: mockCommand({ commandSpy }),
      })

      const passthrough = new GitReadOnlyPassthrough({
        applicationData,
        operationArguments: { args: ['log', '--no-merges'] },
      })
      await passthrough.run()

      expect(passthrough.success()).toBe(true)
    })

    it('when log is given -p, runs git', async () => {
      const commandSpy = mock()
      const applicationData = mockApplicationData({
        command: mockCommand({ commandSpy }),
      })

      const passthrough = new GitReadOnlyPassthrough({
        applicationData,
        operationArguments: { args: ['log', '-p'] },
      })
      await passthrough.run()

      expect(passthrough.success()).toBe(true)
    })

    it('when log is given --output=f, refuses without running git', async () => {
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

    it('when log is given --ext-diff, refuses without running git', async () => {
      const commandSpy = mock()
      const applicationData = mockApplicationData({
        command: mockCommand({ commandSpy }),
      })

      const passthrough = new GitReadOnlyPassthrough({
        applicationData,
        operationArguments: { args: ['log', '--ext-diff'] },
      })
      await passthrough.run()

      expect(commandSpy.mock.calls.length).toBe(0)
      expect(passthrough.reason).toBe(
        'flag not allowed: --ext-diff; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
      )
    })

    it('when log is given -C, refuses without running git', async () => {
      const commandSpy = mock()
      const applicationData = mockApplicationData({
        command: mockCommand({ commandSpy }),
      })

      const passthrough = new GitReadOnlyPassthrough({
        applicationData,
        operationArguments: { args: ['log', '-C', '..'] },
      })
      await passthrough.run()

      expect(commandSpy.mock.calls.length).toBe(0)
      expect(passthrough.reason).toBe(
        'flag not allowed: -C; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
      )
    })

    it('when log is given -c core.pager=x, refuses without running git', async () => {
      const commandSpy = mock()
      const applicationData = mockApplicationData({
        command: mockCommand({ commandSpy }),
      })

      const passthrough = new GitReadOnlyPassthrough({
        applicationData,
        operationArguments: { args: ['log', '-c', 'core.pager=x'] },
      })
      await passthrough.run()

      expect(commandSpy.mock.calls.length).toBe(0)
      expect(passthrough.reason).toBe(
        'flag not allowed: -c; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
      )
    })

    it('when log is given the abbreviated --out=f, refuses without running git', async () => {
      const commandSpy = mock()
      const applicationData = mockApplicationData({
        command: mockCommand({ commandSpy }),
      })

      const passthrough = new GitReadOnlyPassthrough({
        applicationData,
        operationArguments: { args: ['log', '--out=f'] },
      })
      await passthrough.run()

      expect(commandSpy.mock.calls.length).toBe(0)
      expect(passthrough.reason).toBe(
        'flag not allowed: --out=f; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
      )
    })

    it('when log is given a pathspec outside permissions, refuses without running git', async () => {
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
  })

  it('when no subcommand is enabled, refuses log without running git', async () => {
    class EnabledNone extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {}
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const passthrough = new EnabledNone({
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

  it('when a bare argument is outside permissions, refuses without running git', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: {} },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const passthrough = new EnabledLog({
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
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: {} },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: {
        args: ['log', 'HEAD~3', 'origin/main', '--', 'src/a.ts'],
      },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(1)
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
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: {} },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', '--', '--evil'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(1)
    expect(passthrough.success()).toBe(true)
  })

  it('when a pathspec after -- is outside permissions, refuses without running git', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: {} },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', '--', '../x'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe('path not allowed: ../x')
  })

  it('when rev:path has an in-bounds path, runs git', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: {} },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', 'abc123:src/a.ts'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(1)
  })

  it('when rev:path escapes permissions, refuses naming the path', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: {} },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', 'abc123:../x'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe('path not allowed: ../x')
  })

  it('when a path flag value is in bounds, runs git', async () => {
    class EnabledBlame extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        blame: { flags: { '--contents': 'path' } },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledBlame({
      applicationData,
      operationArguments: { args: ['blame', '--contents=notes.txt', 'a.ts'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(1)
  })

  it('when a path flag value is outside permissions, refuses without running git', async () => {
    class EnabledBlame extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        blame: { flags: { '--contents': 'path' } },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledBlame({
      applicationData,
      operationArguments: { args: ['blame', '--contents=../x', 'a.ts'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe('path not allowed: ../x')
  })

  it('when pathspec magic is given, refuses naming it', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: {} },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', ':(top)x', '--', ':!foo'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe('path not allowed: :(top)x, :!foo')
  })

  it('when the index form :0:path is given, refuses it whole', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: {} },
      }
    }
    const applicationData = mockApplicationData({ command: mockCommand() })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', ':0:src/a.ts'] },
    })
    await passthrough.run()

    expect(passthrough.reason).toBe('path not allowed: :0:src/a.ts')
  })

  it('when several paths are denied, names each once and omits allowed ones', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: {} },
      }
    }
    const applicationData = mockApplicationData({ command: mockCommand() })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: {
        args: ['log', '../a', 'HEAD', '--', '../b', '../a'],
      },
    })
    await passthrough.run()

    expect(passthrough.reason).toBe('path not allowed: ../a, ../b')
  })

  it('when diff --no-index is given, refuses the flag before checking paths', async () => {
    class EnabledDiff extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        diff: { flags: {} },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledDiff({
      applicationData,
      operationArguments: {
        args: ['diff', '--no-index', '/etc/passwd', '/etc/hosts'],
      },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --no-index; allowed flags for diff: none',
    )
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

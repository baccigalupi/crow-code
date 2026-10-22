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

  it('when the subcommand is not enabled, names it and lists the enabled ones', async () => {
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
      operationArguments: { args: ['stash'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'subcommand not allowed: stash; allowed subcommands: log',
    )
  })

  it('when an enabled switch is given by its exact spelling, runs git', async () => {
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
      operationArguments: { args: ['log', '--oneline'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-2)).toEqual([
      'log',
      '--oneline',
    ])
  })

  it('when a flag is not enabled, refuses it and lists the allowed flags', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: { '--oneline': 'switch', '-n': 'number' } },
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
      'flag not allowed: --graph; allowed flags for log: --oneline, -n',
    )
  })

  it('when a flag is an abbreviation of an enabled flag, refuses it', async () => {
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
      operationArguments: { args: ['log', '--one'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --one; allowed flags for log: --oneline',
    )
  })

  it('when short flags are clustered, refuses the cluster', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: { '-n': 'number', '-w': 'switch' } },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', '-nw'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: -nw; allowed flags for log: -n, -w',
    )
  })

  it('when a short switch has an attached value, refuses it', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: { '-w': 'switch' } },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', '-w5'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: -w5; allowed flags for log: -w',
    )
  })

  it('when a long valued flag uses --name=value, runs git', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: { '--max-count': 'number' } },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', '--max-count=5'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-2)).toEqual([
      'log',
      '--max-count=5',
    ])
  })

  it('when a long valued flag has its value as a separate argument, refuses it', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: { '--max-count': 'number' } },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', '--max-count', '5'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --max-count; allowed flags for log: --max-count',
    )
  })

  it('when a long switch is given a value, refuses it', async () => {
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
      operationArguments: { args: ['log', '--oneline=yes'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --oneline=yes; allowed flags for log: --oneline',
    )
  })

  it('when a short valued flag has a separate value, runs git', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: { '-n': 'number' } },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', '-n', '5'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-3)).toEqual([
      'log',
      '-n',
      '5',
    ])
  })

  it('when a short valued flag has an attached value, runs git', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: { '-n': 'number' } },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', '-n5'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-2)).toEqual(['log', '-n5'])
  })

  it('when a short valued flag has no value, refuses it', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: { '-n': 'number' } },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', '-n'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: -n; allowed flags for log: -n',
    )
  })

  it('when a short number flag has a non-numeric separate value, refuses it', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: { '-n': 'number' } },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', '-n', 'x'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe('flag value not a number: -n x')
  })

  it('when a long number flag has a non-numeric value, refuses it', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: { '--max-count': 'number' } },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', '--max-count=x'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe('flag value not a number: --max-count=x')
  })

  it('when a text flag is given a value, runs git', async () => {
    class EnabledLog extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        log: { flags: { '--author': 'text', '-S': 'text' } },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledLog({
      applicationData,
      operationArguments: { args: ['log', '--author=ada', '-Sfoo'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-3)).toEqual([
      'log',
      '--author=ada',
      '-Sfoo',
    ])
  })

  it('when the first argument is -C, refuses it as a global option', async () => {
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
      operationArguments: { args: ['-C', '/tmp', 'log'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'subcommand not allowed: -C; allowed subcommands: log',
    )
  })

  it('when the first argument is -c, refuses it as a global option', async () => {
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
      operationArguments: { args: ['-c', 'core.pager=x', 'log'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'subcommand not allowed: -c; allowed subcommands: log',
    )
  })

  it('when the first argument is --git-dir, refuses it as a global option', async () => {
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
      operationArguments: { args: ['--git-dir=/x', 'log'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'subcommand not allowed: --git-dir=/x; allowed subcommands: log',
    )
  })

  it('when the first argument is --work-tree, refuses it as a global option', async () => {
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
      operationArguments: { args: ['--work-tree=/x', 'log'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'subcommand not allowed: --work-tree=/x; allowed subcommands: log',
    )
  })

  it('when the first argument is --exec-path, refuses it as a global option', async () => {
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
      operationArguments: { args: ['--exec-path=/x', 'log'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'subcommand not allowed: --exec-path=/x; allowed subcommands: log',
    )
  })

  it('when the first argument is --namespace, refuses it as a global option', async () => {
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
      operationArguments: { args: ['--namespace=x', 'log'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'subcommand not allowed: --namespace=x; allowed subcommands: log',
    )
  })

  it('when the first argument is --super-prefix, refuses it as a global option', async () => {
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
      operationArguments: { args: ['--super-prefix=x', 'log'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'subcommand not allowed: --super-prefix=x; allowed subcommands: log',
    )
  })

  it('when a form-gated subcommand is given an allowed form, runs git', async () => {
    class EnabledStash extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        stash: { forms: ['list'], flags: {} },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledStash({
      applicationData,
      operationArguments: { args: ['stash', 'list'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-2)).toEqual([
      'stash',
      'list',
    ])
  })

  it('when a form-gated subcommand is given another form, refuses it', async () => {
    class EnabledStash extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        stash: { forms: ['list'], flags: {} },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledStash({
      applicationData,
      operationArguments: { args: ['stash', 'pop'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'subcommand not allowed: stash pop; allowed forms for stash: list',
    )
  })

  it('when a form-gated subcommand is given no form, refuses it', async () => {
    class EnabledStash extends GitReadOnlyPassthrough {
      protected override enabled: Record<string, GitSubcommand> = {
        stash: { forms: ['list'], flags: {} },
      }
    }
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new EnabledStash({
      applicationData,
      operationArguments: { args: ['stash'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'subcommand not allowed: stash; allowed forms for stash: list',
    )
  })

  it('when --output=<file> is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '--output=f'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --output=f; allowed flags for log: --oneline',
    )
  })

  it('when -o is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '-o'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: -o; allowed flags for log: --oneline',
    )
  })

  it('when --ext-diff is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '--ext-diff'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --ext-diff; allowed flags for log: --oneline',
    )
  })

  it('when -O<orderfile> is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '-Ofile'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: -Ofile; allowed flags for log: --oneline',
    )
  })

  it('when --open-files-in-pager is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '--open-files-in-pager'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --open-files-in-pager; allowed flags for log: --oneline',
    )
  })

  it('when --exec=<cmd> is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '--exec=x'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --exec=x; allowed flags for log: --oneline',
    )
  })

  it('when --upload-pack is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '--upload-pack=x'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --upload-pack=x; allowed flags for log: --oneline',
    )
  })

  it('when --receive-pack is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '--receive-pack=x'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --receive-pack=x; allowed flags for log: --oneline',
    )
  })

  it('when --lost-found is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '--lost-found'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --lost-found; allowed flags for log: --oneline',
    )
  })

  it('when --no-index is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '--no-index'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --no-index; allowed flags for log: --oneline',
    )
  })

  it('when --batch is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '--batch'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --batch; allowed flags for log: --oneline',
    )
  })

  it('when --batch-command is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '--batch-command'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --batch-command; allowed flags for log: --oneline',
    )
  })

  it('when --edit is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '--edit'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --edit; allowed flags for log: --oneline',
    )
  })

  it('when -e is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '-e'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: -e; allowed flags for log: --oneline',
    )
  })

  it('when --help is given, refuses it', async () => {
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
      operationArguments: { args: ['log', '--help'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --help; allowed flags for log: --oneline',
    )
  })

  it('when several flags are refused, names every one of them', async () => {
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
      operationArguments: { args: ['log', '--output=f', '--exec=x'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --output=f, --exec=x; allowed flags for log: --oneline',
    )
  })

  it('when a subcommand allows no flags, the refusal says none are allowed', async () => {
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
      operationArguments: { args: ['log', '--graph'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --graph; allowed flags for log: none',
    )
  })

  it('when a subcommand name is an object prototype key, refuses it', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['constructor'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'subcommand not allowed: constructor; allowed subcommands: none',
    )
  })

  it('when no arguments are given, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: [] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'subcommand not allowed: (none); allowed subcommands: none',
    )
  })
})

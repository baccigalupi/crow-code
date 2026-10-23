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

  it('when log is requested, runs git in the runtime cwd', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      cwd: '/work',
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['log'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].cwd).toBe('/work')
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

  it('when status is requested, runs git status', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: {
        args: ['status', '--porcelain=v2', '--', 'src/a.ts'],
      },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-4)).toEqual([
      'status',
      '--porcelain=v2',
      '--',
      'src/a.ts',
    ])
  })

  it('when ls-files is requested, runs git ls-files', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['ls-files', '-o', '--exclude-standard'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-3)).toEqual([
      'ls-files',
      '-o',
      '--exclude-standard',
    ])
  })

  it('when ls-tree is requested, runs git ls-tree', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['ls-tree', '-r', 'HEAD'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-3)).toEqual([
      'ls-tree',
      '-r',
      'HEAD',
    ])
  })

  it('when rev-parse is requested, runs git rev-parse', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['rev-parse', '--show-toplevel'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-2)).toEqual([
      'rev-parse',
      '--show-toplevel',
    ])
  })

  it('when rev-list is requested, runs git rev-list', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['rev-list', '--count', 'HEAD'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-3)).toEqual([
      'rev-list',
      '--count',
      'HEAD',
    ])
  })

  it('when merge-base is requested, runs git merge-base', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['merge-base', 'a', 'b'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-3)).toEqual([
      'merge-base',
      'a',
      'b',
    ])
  })

  it('when describe is requested, runs git describe', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['describe', 'HEAD'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-2)).toEqual([
      'describe',
      'HEAD',
    ])
  })

  it('when name-rev is requested, runs git name-rev', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['name-rev', '--name-only', 'HEAD'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-3)).toEqual([
      'name-rev',
      '--name-only',
      'HEAD',
    ])
  })

  it('when count-objects is requested, runs git count-objects', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['count-objects', '-v'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-2)).toEqual([
      'count-objects',
      '-v',
    ])
  })

  it('when check-ignore is requested, runs git check-ignore', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['check-ignore', '-v', 'a.log'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-3)).toEqual([
      'check-ignore',
      '-v',
      'a.log',
    ])
  })

  it('when check-attr is requested, runs git check-attr', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['check-attr', '-a', 'a.ts'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-3)).toEqual([
      'check-attr',
      '-a',
      'a.ts',
    ])
  })

  it('when grep is requested, runs git grep', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['grep', '-n', 'foo'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-3)).toEqual([
      'grep',
      '-n',
      'foo',
    ])
  })

  it('when grep is given --no-index, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['grep', '--no-index', 'x'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --no-index; allowed flags for grep: -E, -F, -c, -e, -i, -l, -n, -w',
    )
  })

  it('when check-ignore is given --stdin, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['check-ignore', '--stdin'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --stdin; allowed flags for check-ignore: -v',
    )
  })

  it('when show-ref is requested, runs git show-ref', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['show-ref', '--heads'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-2)).toEqual([
      'show-ref',
      '--heads',
    ])
  })

  it('when for-each-ref is requested, runs git for-each-ref', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: {
        args: ['for-each-ref', '--format=%(refname)', 'refs/heads'],
      },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-3)).toEqual([
      'for-each-ref',
      '--format=%(refname)',
      'refs/heads',
    ])
  })

  it('when cat-file is requested, runs git cat-file', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['cat-file', '-p', 'HEAD:src/a.ts'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-3)).toEqual([
      'cat-file',
      '-p',
      'HEAD:src/a.ts',
    ])
  })

  it('when branch -a is requested, runs git branch -a', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['branch', '-a'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls[0][1].args.slice(-2)).toEqual(['branch', '-a'])
  })

  it('when branch is given a name, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['branch', 'foo'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe('argument not allowed: foo')
  })

  it('when rev-parse is given --git-dir, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['rev-parse', '--git-dir'] },
    })
    await passthrough.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(passthrough.reason).toBe(
      'flag not allowed: --git-dir; allowed flags for rev-parse: --abbrev-ref, --is-inside-work-tree, --short, --show-toplevel, --verify',
    )
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
      'subcommand not allowed: push; allowed subcommands: blame, branch, cat-file, check-attr, check-ignore, config, count-objects, describe, diff, for-each-ref, grep, log, ls-files, ls-tree, merge-base, name-rev, reflog, remote, rev-list, rev-parse, show, show-ref, stash, status, tag, worktree',
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
      'subcommand not allowed: difftool; allowed subcommands: blame, branch, cat-file, check-attr, check-ignore, config, count-objects, describe, diff, for-each-ref, grep, log, ls-files, ls-tree, merge-base, name-rev, reflog, remote, rev-list, rev-parse, show, show-ref, stash, status, tag, worktree',
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
      'subcommand not allowed: (none); allowed subcommands: blame, branch, cat-file, check-attr, check-ignore, config, count-objects, describe, diff, for-each-ref, grep, log, ls-files, ls-tree, merge-base, name-rev, reflog, remote, rev-list, rev-parse, show, show-ref, stash, status, tag, worktree',
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
      'subcommand not allowed: constructor; allowed subcommands: blame, branch, cat-file, check-attr, check-ignore, config, count-objects, describe, diff, for-each-ref, grep, log, ls-files, ls-tree, merge-base, name-rev, reflog, remote, rev-list, rev-parse, show, show-ref, stash, status, tag, worktree',
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
      'subcommand not allowed: -C; allowed subcommands: blame, branch, cat-file, check-attr, check-ignore, config, count-objects, describe, diff, for-each-ref, grep, log, ls-files, ls-tree, merge-base, name-rev, reflog, remote, rev-list, rev-parse, show, show-ref, stash, status, tag, worktree',
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

  it('when add is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['add'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when commit is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['commit'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when reset is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['reset'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when restore is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['restore'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when checkout is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['checkout'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when switch is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['switch'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when merge is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['merge'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when rebase is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['rebase'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when cherry-pick is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['cherry-pick'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when revert is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['revert'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when apply is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['apply'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when am is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['am'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when pull is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['pull'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when fetch is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['fetch'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when clone is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['clone'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when init is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['init'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when rm is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['rm'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when mv is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['mv'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when clean is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['clean'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when gc is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['gc'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when prune is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['prune'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when repack is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['repack'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when update-index is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['update-index'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when update-ref is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['update-ref'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when symbolic-ref is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['symbolic-ref'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when write-tree is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['write-tree'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when commit-tree is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['commit-tree'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when hash-object is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['hash-object'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when mktag is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['mktag'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when mktree is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['mktree'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when bisect is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['bisect'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when filter-branch is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['filter-branch'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when replace is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['replace'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when pack-refs is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['pack-refs'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when maintenance is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['maintenance'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when sparse-checkout is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['sparse-checkout'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when lfs is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['lfs'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when daemon is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['daemon'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when instaweb is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['instaweb'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when web--browse is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['web--browse'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when send-email is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['send-email'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when request-pull is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['request-pull'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when archive is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['archive'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when bundle is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['bundle'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when mergetool is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['mergetool'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when an alias is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['co'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when an external git-foo is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['foo'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when tag is given a name, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['tag', 'v1'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when config is given a value, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['config', 'user.name', 'x'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when remote add is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['remote', 'add', 'origin', 'url'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when stash has no list form, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['stash'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when reflog expire is requested, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['reflog', 'expire'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when diff is given --no-index, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['diff', '--no-index', 'a', 'b'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when log is given an abbreviated --out=f, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['log', '--out=f'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when log is given a :(top) pathspec, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['log', ':(top)x'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when show is given HEAD:../../etc/passwd, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['show', 'HEAD:../../etc/passwd'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when -c core.pager=x precedes the subcommand, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['-c', 'core.pager=x', 'log'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when -c alias.x=!sh precedes the subcommand, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['-c', 'alias.x=!sh', 'log'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when --git-dir=.. precedes the subcommand, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['--git-dir=..', 'log'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })

  it('when --work-tree=.. precedes the subcommand, refuses without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const passthrough = new GitReadOnlyPassthrough({
      applicationData,
      operationArguments: { args: ['--work-tree=..', 'log'] },
    })
    await passthrough.run()

    expect(passthrough.success()).toBe(false)
    expect(commandSpy.mock.calls.length).toBe(0)
  })
})

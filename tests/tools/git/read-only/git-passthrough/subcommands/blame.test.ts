import { describe, expect, it } from 'bun:test'
import { GitBlameSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/blame.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../../support/mock-command.ts'

describe('GitBlameSubcommand', () => {
  it('when given --porcelain and a file, builds git blame arguments with them', () => {
    const subcommand = new GitBlameSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--porcelain', '--', 'src/a.ts'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'blame',
      '--line-porcelain',
      '--porcelain',
      '--',
      'src/a.ts',
    ])
  })

  it('when given -L, -w and a revision, does not refuse', () => {
    const subcommand = new GitBlameSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: {
        args: ['-L', '1,5', '-w', 'abc123', '--', 'src/a.ts'],
      },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --contents, requests its path along with the file', () => {
    const subcommand = new GitBlameSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--contents=notes.txt', '--', 'src/a.ts'] },
    })

    const paths = subcommand.requestedPaths()

    expect(paths).toEqual(['notes.txt', 'src/a.ts'])
  })

  it('when git succeeds with a range and a revision, returns typed lines', async () => {
    const stdout = [
      'abc1230000000000000000000000000000000000 1 1 1',
      'author Ada',
      'author-time 1767312000',
      'summary Add a',
      'filename src/a.ts',
      '\tconst a = 1',
      'abc1230000000000000000000000000000000000 2 2 1',
      'author Ada',
      'author-time 1767312000',
      'summary Add a',
      'filename src/a.ts',
      '\tconst b = 2',
      '',
    ].join('\n')
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout }),
    })
    const subcommand = new GitBlameSubcommand({
      applicationData,
      operationArguments: {
        args: ['-L', '1,2', 'abc123', '--', 'src/a.ts'],
      },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      lines: [
        {
          line: 1,
          sha: 'abc1230000000000000000000000000000000000',
          author: 'Ada',
          date: '2026-01-02T00:00:00.000Z',
          summary: 'Add a',
          content: 'const a = 1',
        },
        {
          line: 2,
          sha: 'abc1230000000000000000000000000000000000',
          author: 'Ada',
          date: '2026-01-02T00:00:00.000Z',
          summary: 'Add a',
          content: 'const b = 2',
        },
      ],
    })
  })

  it('when given -L and a revision, passes them to git after the fixed flag', () => {
    const subcommand = new GitBlameSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: {
        args: ['-L', '1,2', 'abc123', '--', 'src/a.ts'],
      },
    })

    const gitArguments = subcommand.gitArguments()

    expect(gitArguments).toEqual([
      'blame',
      '--line-porcelain',
      '-L',
      '1,2',
      'abc123',
      '--',
      'src/a.ts',
    ])
  })

  it('when git fails, has no lines', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        success: false,
        code: 128,
        stderr: 'fatal: no such path',
      }),
    })
    const subcommand = new GitBlameSubcommand({
      applicationData,
      operationArguments: { args: ['--', 'src/a.ts'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ lines: [] })
    expect(subcommand.reason).toBe('fatal: no such path')
  })

  it('when given -C, refuses naming the allowed flags', () => {
    const subcommand = new GitBlameSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-C', '../x', '--', 'src/a.ts'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -C; allowed flags for blame: --contents, --porcelain, -L, -w',
    )
  })
})

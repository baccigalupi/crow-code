import { describe, expect, it } from 'bun:test'
import { GitCatFileSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/cat-file.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../../support/mock-command.ts'

describe('GitCatFileSubcommand', () => {
  it('when given -p and a rev:path object, does not refuse and checks the path', () => {
    const subcommand = new GitCatFileSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-p', 'HEAD:src/a.ts'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()
    const requestedPaths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['cat-file', '-p', 'HEAD:src/a.ts'])
    expect(requestedPaths).toEqual(['HEAD', 'src/a.ts'])
  })

  it('when given -t, does not refuse', () => {
    const subcommand = new GitCatFileSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-t', 'HEAD'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given -s, does not refuse', () => {
    const subcommand = new GitCatFileSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-s', 'HEAD'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given -e, does not refuse', () => {
    const subcommand = new GitCatFileSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-e', 'HEAD'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --batch, refuses naming the allowed flags', () => {
    const subcommand = new GitCatFileSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--batch'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --batch; allowed flags for cat-file: -e, -p, -s, -t',
    )
  })

  it('when given --batch-check, refuses naming the allowed flags', () => {
    const subcommand = new GitCatFileSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--batch-check'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --batch-check; allowed flags for cat-file: -e, -p, -s, -t',
    )
  })

  it('when given --batch-command, refuses naming the allowed flags', () => {
    const subcommand = new GitCatFileSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--batch-command'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --batch-command; allowed flags for cat-file: -e, -p, -s, -t',
    )
  })

  it('when given --textconv, refuses naming the allowed flags', () => {
    const subcommand = new GitCatFileSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--textconv', 'HEAD:a'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --textconv; allowed flags for cat-file: -e, -p, -s, -t',
    )
  })

  it('when given --filters, refuses naming the allowed flags', () => {
    const subcommand = new GitCatFileSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--filters', 'HEAD:a'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --filters; allowed flags for cat-file: -e, -p, -s, -t',
    )
  })

  it('when given --batch with a format, refuses naming the full flag', () => {
    const subcommand = new GitCatFileSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--batch=%(objectname)'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --batch=%(objectname); allowed flags for cat-file: -e, -p, -s, -t',
    )
  })

  it('when git cat-file -t runs, returns typed kind', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'blob\n' }),
    })
    const subcommand = new GitCatFileSubcommand({
      applicationData,
      operationArguments: { args: ['-t', 'HEAD:allowed.txt'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ kind: 'blob' })
  })

  it('when git cat-file -s runs, returns typed size', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: '12\n' }),
    })
    const subcommand = new GitCatFileSubcommand({
      applicationData,
      operationArguments: { args: ['-s', 'HEAD:allowed.txt'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ size: 12 })
  })

  it('when git cat-file -p runs, returns path-less text', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'allowed two\n' }),
    })
    const subcommand = new GitCatFileSubcommand({
      applicationData,
      operationArguments: { args: ['-p', 'HEAD:allowed.txt'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ text: 'allowed two\n' })
  })

  it('when git cat-file -e runs, returns raw stdout', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: '' }),
    })
    const subcommand = new GitCatFileSubcommand({
      applicationData,
      operationArguments: { args: ['-e', 'HEAD:allowed.txt'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ stdout: '' })
  })
})

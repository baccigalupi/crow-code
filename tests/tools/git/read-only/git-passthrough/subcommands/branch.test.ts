import { describe, expect, it } from 'bun:test'
import { GitBranchSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/branch.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../../support/mock-command.ts'

describe('GitBranchSubcommand', () => {
  it('when git branch -v runs, returns typed entries', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: '* main    7f2203f second\n' }),
    })
    const subcommand = new GitBranchSubcommand({
      applicationData,
      operationArguments: { args: ['-v'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      entries: [
        { name: 'main', current: true, sha: '7f2203f', subject: 'second' },
      ],
    })
  })

  it('when git branch --show-current runs, returns the name', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'main\n' }),
    })
    const subcommand = new GitBranchSubcommand({
      applicationData,
      operationArguments: { args: ['--show-current'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ name: 'main' })
  })

  it('when given nothing, does not refuse', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: [] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['branch'])
  })

  it('when given -a, does not refuse', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-a'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given -r, does not refuse', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-r'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given -v, does not refuse', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-v'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --list, does not refuse', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--list'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --show-current, does not refuse', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--show-current'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --contains and a revision, does not refuse', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--contains', 'HEAD'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --merged and a revision, does not refuse', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--merged', 'main'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given -d, refuses the flag', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-d', 'x'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -d; allowed flags for branch: --contains, --list, --merged, --show-current, -a, -r, -v',
    )
  })

  it('when given -D, refuses the flag', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-D', 'x'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -D; allowed flags for branch: --contains, --list, --merged, --show-current, -a, -r, -v',
    )
  })

  it('when given -m, refuses the flag', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-m', 'x'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -m; allowed flags for branch: --contains, --list, --merged, --show-current, -a, -r, -v',
    )
  })

  it('when given -M, refuses the flag', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-M', 'x'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -M; allowed flags for branch: --contains, --list, --merged, --show-current, -a, -r, -v',
    )
  })

  it('when given -c, refuses the flag', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-c', 'x'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -c; allowed flags for branch: --contains, --list, --merged, --show-current, -a, -r, -v',
    )
  })

  it('when given -C, refuses the flag', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-C', 'x'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -C; allowed flags for branch: --contains, --list, --merged, --show-current, -a, -r, -v',
    )
  })

  it('when given -f, refuses the flag', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-f', 'x'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -f; allowed flags for branch: --contains, --list, --merged, --show-current, -a, -r, -v',
    )
  })

  it('when given --set-upstream-to, refuses the flag', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--set-upstream-to=o/x'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --set-upstream-to=o/x; allowed flags for branch: --contains, --list, --merged, --show-current, -a, -r, -v',
    )
  })

  it('when given --unset-upstream, refuses the flag', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--unset-upstream'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --unset-upstream; allowed flags for branch: --contains, --list, --merged, --show-current, -a, -r, -v',
    )
  })

  it('when given --edit-description, refuses the flag', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--edit-description'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --edit-description; allowed flags for branch: --contains, --list, --merged, --show-current, -a, -r, -v',
    )
  })

  it('when given a bare name, refuses the argument', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['foo'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('argument not allowed: foo')
  })

  it('when given -a and a bare name, refuses the argument', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-a', 'foo'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('argument not allowed: foo')
  })

  it('when given a name after a separator, refuses the argument', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--', 'foo'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('argument not allowed: foo')
  })

  it('when given grouped short flags, refuses them', () => {
    const subcommand = new GitBranchSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-vv'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -vv; allowed flags for branch: --contains, --list, --merged, --show-current, -a, -r, -v',
    )
  })
})

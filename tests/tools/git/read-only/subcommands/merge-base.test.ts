import { describe, expect, it } from 'bun:test'
import { GitMergeBaseSubcommand } from '../../../../../src/tools/git/read-only/subcommands/merge-base.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('GitMergeBaseSubcommand', () => {
  it('when given --is-ancestor and two revisions, does not refuse', () => {
    const subcommand = new GitMergeBaseSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--is-ancestor', 'a', 'b'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()
    const requestedPaths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['merge-base', '--is-ancestor', 'a', 'b'])
    expect(requestedPaths).toEqual(['a', 'b'])
  })

  it('when given --octopus, does not refuse', () => {
    const subcommand = new GitMergeBaseSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--octopus', 'a', 'b', 'c'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --fork-point, does not refuse', () => {
    const subcommand = new GitMergeBaseSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--fork-point', 'origin/main'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --independent, does not refuse', () => {
    const subcommand = new GitMergeBaseSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--independent', 'a', 'b'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --all, does not refuse', () => {
    const subcommand = new GitMergeBaseSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--all', 'a', 'b'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --stdin, refuses naming the allowed flags', () => {
    const subcommand = new GitMergeBaseSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--stdin'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --stdin; allowed flags for merge-base: --all, --fork-point, --independent, --is-ancestor, --octopus',
    )
  })

  it('when git merge-base runs, returns a typed sha', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout: 'ffd175847ab5c34abf8e3a66c4bab26b9ef87939\n',
      }),
    })
    const subcommand = new GitMergeBaseSubcommand({
      applicationData,
      operationArguments: { args: ['HEAD', 'HEAD~1'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ sha: 'ffd175847ab5c34abf8e3a66c4bab26b9ef87939' })
  })

  it('when git merge-base --all runs, returns typed shas', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout: 'ffd175847ab5c34abf8e3a66c4bab26b9ef87939\n',
      }),
    })
    const subcommand = new GitMergeBaseSubcommand({
      applicationData,
      operationArguments: { args: ['--all', 'HEAD', 'HEAD~1'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      shas: ['ffd175847ab5c34abf8e3a66c4bab26b9ef87939'],
    })
  })

  it('when git merge-base --independent runs, returns typed shas', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout: '7f2203f286226e6c29da25b8edb35b13a7efa7c6\n',
      }),
    })
    const subcommand = new GitMergeBaseSubcommand({
      applicationData,
      operationArguments: { args: ['--independent', 'HEAD', 'HEAD~1'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      shas: ['7f2203f286226e6c29da25b8edb35b13a7efa7c6'],
    })
  })

  it("when git merge-base --is-ancestor exits 128, fails with git's message", async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        success: false,
        code: 128,
        stderr: 'fatal: Not a valid object name nosuchrev',
      }),
    })
    const subcommand = new GitMergeBaseSubcommand({
      applicationData,
      operationArguments: { args: ['--is-ancestor', 'HEAD', 'nosuchrev'] },
    })

    await subcommand.run()

    expect(subcommand.success()).toBe(false)
    expect(subcommand.reason).toBe('fatal: Not a valid object name nosuchrev')
  })

  it('when git merge-base --is-ancestor exits 1, returns isAncestor false', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ success: false, code: 1 }),
    })
    const subcommand = new GitMergeBaseSubcommand({
      applicationData,
      operationArguments: { args: ['--is-ancestor', 'HEAD', 'HEAD~1'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(subcommand.success()).toBe(true)
    expect(result).toEqual({ isAncestor: false })
  })

  it('when git merge-base --is-ancestor exits 0, returns isAncestor true', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: '' }),
    })
    const subcommand = new GitMergeBaseSubcommand({
      applicationData,
      operationArguments: { args: ['--is-ancestor', 'HEAD~1', 'HEAD'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ isAncestor: true })
  })
})

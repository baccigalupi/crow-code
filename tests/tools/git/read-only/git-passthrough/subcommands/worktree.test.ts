import { describe, expect, it } from 'bun:test'
import { GitWorktreeSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/worktree.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'

describe('GitWorktreeSubcommand', () => {
  it('when given list, does not refuse', () => {
    const subcommand = new GitWorktreeSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['list'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['worktree', 'list'])
  })

  it('when given add, refuses naming the allowed forms', () => {
    const subcommand = new GitWorktreeSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['add', '../x'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: worktree add; allowed forms for worktree: list',
    )
  })

  it('when list is given an argument, refuses the argument', () => {
    const subcommand = new GitWorktreeSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['list', 'foo'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('argument not allowed: foo')
  })
})

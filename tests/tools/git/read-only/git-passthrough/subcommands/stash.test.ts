import { describe, expect, it } from 'bun:test'
import { GitStashSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/stash.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../../support/mock-command.ts'

describe('GitStashSubcommand', () => {
  it('when given list, does not refuse', () => {
    const subcommand = new GitStashSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['list'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['stash', 'list'])
  })

  it('when given pop, refuses naming the allowed forms', () => {
    const subcommand = new GitStashSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['pop'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: stash pop; allowed forms for stash: list',
    )
  })

  it('when given nothing, refuses naming the allowed forms', () => {
    const subcommand = new GitStashSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: [] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: stash; allowed forms for stash: list',
    )
  })

  it('when given push, refuses naming the allowed forms', () => {
    const subcommand = new GitStashSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['push'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: stash push; allowed forms for stash: list',
    )
  })

  it('when list is given an argument, refuses the argument', () => {
    const subcommand = new GitStashSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['list', 'foo'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('argument not allowed: foo')
  })

  it('when git stash list runs, returns typed entries', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'stash@{0}: On main: fixture stash\n' }),
    })
    const subcommand = new GitStashSubcommand({
      applicationData,
      operationArguments: { args: ['list'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      entries: [{ selector: 'stash@{0}', message: 'On main: fixture stash' }],
    })
  })
})

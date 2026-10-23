import { describe, expect, it } from 'bun:test'
import { GitMergeBaseSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/merge-base.ts'

describe('GitMergeBaseSubcommand', () => {
  it('when given --is-ancestor and two revisions, does not refuse', () => {
    const subcommand = new GitMergeBaseSubcommand({
      args: ['--is-ancestor', 'a', 'b'],
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
      args: ['--octopus', 'a', 'b', 'c'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --fork-point, does not refuse', () => {
    const subcommand = new GitMergeBaseSubcommand({
      args: ['--fork-point', 'origin/main'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --independent, does not refuse', () => {
    const subcommand = new GitMergeBaseSubcommand({
      args: ['--independent', 'a', 'b'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --all, does not refuse', () => {
    const subcommand = new GitMergeBaseSubcommand({
      args: ['--all', 'a', 'b'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --stdin, refuses naming the allowed flags', () => {
    const subcommand = new GitMergeBaseSubcommand({ args: ['--stdin'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --stdin; allowed flags for merge-base: --all, --fork-point, --independent, --is-ancestor, --octopus',
    )
  })
})

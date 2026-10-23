import { describe, expect, it } from 'bun:test'
import { GitSubcommands } from '../../../../../src/tools/git/read-only/git-passthrough/git-subcommands.ts'
import { GitLogSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/subcommands/log.ts'
import { GitLsFilesSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/subcommands/ls-files.ts'
import { GitLsTreeSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/subcommands/ls-tree.ts'
import { GitStatusSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/subcommands/status.ts'

describe('GitSubcommands#classFor', () => {
  it('returns the log subcommand class for log', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('log')

    expect(Subcommand).toBe(GitLogSubcommand)
  })

  it('returns the status subcommand class for status', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('status')

    expect(Subcommand).toBe(GitStatusSubcommand)
  })

  it('returns the ls-files subcommand class for ls-files', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('ls-files')

    expect(Subcommand).toBe(GitLsFilesSubcommand)
  })

  it('returns the ls-tree subcommand class for ls-tree', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('ls-tree')

    expect(Subcommand).toBe(GitLsTreeSubcommand)
  })

  it('returns a class refusing push and listing the allowed subcommands', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('push')

    expect(new Subcommand({ args: [] }).refusal()).toBe(
      'subcommand not allowed: push; allowed subcommands: blame, diff, log, ls-files, ls-tree, show, status',
    )
  })

  it('returns a refusing class for inherited object keys', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('constructor')

    expect(new Subcommand({ args: [] }).refusal()).toBe(
      'subcommand not allowed: constructor; allowed subcommands: blame, diff, log, ls-files, ls-tree, show, status',
    )
  })
})

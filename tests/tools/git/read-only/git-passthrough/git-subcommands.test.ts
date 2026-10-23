import { describe, expect, it } from 'bun:test'
import { GitSubcommands } from '../../../../../src/tools/git/read-only/git-passthrough/git-subcommands.ts'
import { GitCatFileSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/subcommands/cat-file.ts'
import { GitDescribeSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/subcommands/describe.ts'
import { GitLogSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/subcommands/log.ts'
import { GitLsFilesSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/subcommands/ls-files.ts'
import { GitLsTreeSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/subcommands/ls-tree.ts'
import { GitMergeBaseSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/subcommands/merge-base.ts'
import { GitNameRevSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/subcommands/name-rev.ts'
import { GitRevListSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/subcommands/rev-list.ts'
import { GitRevParseSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/subcommands/rev-parse.ts'
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

  it('returns the rev-parse subcommand class for rev-parse', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('rev-parse')

    expect(Subcommand).toBe(GitRevParseSubcommand)
  })

  it('returns the rev-list subcommand class for rev-list', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('rev-list')

    expect(Subcommand).toBe(GitRevListSubcommand)
  })

  it('returns the merge-base subcommand class for merge-base', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('merge-base')

    expect(Subcommand).toBe(GitMergeBaseSubcommand)
  })

  it('returns the describe subcommand class for describe', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('describe')

    expect(Subcommand).toBe(GitDescribeSubcommand)
  })

  it('returns the name-rev subcommand class for name-rev', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('name-rev')

    expect(Subcommand).toBe(GitNameRevSubcommand)
  })

  it('returns the cat-file subcommand class for cat-file', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('cat-file')

    expect(Subcommand).toBe(GitCatFileSubcommand)
  })

  it('returns a class refusing push and listing the allowed subcommands', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('push')

    expect(new Subcommand({ args: [] }).refusal()).toBe(
      'subcommand not allowed: push; allowed subcommands: blame, cat-file, describe, diff, log, ls-files, ls-tree, merge-base, name-rev, rev-list, rev-parse, show, status',
    )
  })

  it('returns a refusing class for inherited object keys', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('constructor')

    expect(new Subcommand({ args: [] }).refusal()).toBe(
      'subcommand not allowed: constructor; allowed subcommands: blame, cat-file, describe, diff, log, ls-files, ls-tree, merge-base, name-rev, rev-list, rev-parse, show, status',
    )
  })
})

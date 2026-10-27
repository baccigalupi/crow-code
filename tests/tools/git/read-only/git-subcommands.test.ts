import { describe, expect, it } from 'bun:test'
import { GitSubcommands } from '../../../../src/tools/git/read-only/git-subcommands.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { GitCatFileSubcommand } from '../../../../src/tools/git/read-only/subcommands/cat-file.ts'
import { GitCheckAttrSubcommand } from '../../../../src/tools/git/read-only/subcommands/check-attr.ts'
import { GitCheckIgnoreSubcommand } from '../../../../src/tools/git/read-only/subcommands/check-ignore.ts'
import { GitDescribeSubcommand } from '../../../../src/tools/git/read-only/subcommands/describe.ts'
import { GitCountObjectsSubcommand } from '../../../../src/tools/git/read-only/subcommands/count-objects.ts'
import { GitForEachRefSubcommand } from '../../../../src/tools/git/read-only/subcommands/for-each-ref.ts'
import { GitGrepSubcommand } from '../../../../src/tools/git/read-only/subcommands/grep.ts'
import { GitShowRefSubcommand } from '../../../../src/tools/git/read-only/subcommands/show-ref.ts'
import { GitLogSubcommand } from '../../../../src/tools/git/read-only/subcommands/log.ts'
import { GitLsFilesSubcommand } from '../../../../src/tools/git/read-only/subcommands/ls-files.ts'
import { GitLsTreeSubcommand } from '../../../../src/tools/git/read-only/subcommands/ls-tree.ts'
import { GitMergeBaseSubcommand } from '../../../../src/tools/git/read-only/subcommands/merge-base.ts'
import { GitNameRevSubcommand } from '../../../../src/tools/git/read-only/subcommands/name-rev.ts'
import { GitRevListSubcommand } from '../../../../src/tools/git/read-only/subcommands/rev-list.ts'
import { GitRevParseSubcommand } from '../../../../src/tools/git/read-only/subcommands/rev-parse.ts'
import { GitStatusSubcommand } from '../../../../src/tools/git/read-only/subcommands/status.ts'
import { GitBranchSubcommand } from '../../../../src/tools/git/read-only/subcommands/branch.ts'
import { GitConfigSubcommand } from '../../../../src/tools/git/read-only/subcommands/config.ts'
import { GitReflogSubcommand } from '../../../../src/tools/git/read-only/subcommands/reflog.ts'
import { GitRemoteSubcommand } from '../../../../src/tools/git/read-only/subcommands/remote.ts'
import { GitStashSubcommand } from '../../../../src/tools/git/read-only/subcommands/stash.ts'
import { GitTagSubcommand } from '../../../../src/tools/git/read-only/subcommands/tag.ts'
import { GitWorktreeSubcommand } from '../../../../src/tools/git/read-only/subcommands/worktree.ts'

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

  it('returns the count-objects subcommand class for count-objects', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('count-objects')

    expect(Subcommand).toBe(GitCountObjectsSubcommand)
  })

  it('returns the check-ignore subcommand class for check-ignore', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('check-ignore')

    expect(Subcommand).toBe(GitCheckIgnoreSubcommand)
  })

  it('returns the check-attr subcommand class for check-attr', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('check-attr')

    expect(Subcommand).toBe(GitCheckAttrSubcommand)
  })

  it('returns the grep subcommand class for grep', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('grep')

    expect(Subcommand).toBe(GitGrepSubcommand)
  })

  it('returns the show-ref subcommand class for show-ref', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('show-ref')

    expect(Subcommand).toBe(GitShowRefSubcommand)
  })

  it('returns the for-each-ref subcommand class for for-each-ref', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('for-each-ref')

    expect(Subcommand).toBe(GitForEachRefSubcommand)
  })

  it('returns the branch subcommand class for branch', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('branch')

    expect(Subcommand).toBe(GitBranchSubcommand)
  })

  it('returns the tag subcommand class for tag', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('tag')

    expect(Subcommand).toBe(GitTagSubcommand)
  })

  it('returns the remote subcommand class for remote', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('remote')

    expect(Subcommand).toBe(GitRemoteSubcommand)
  })

  it('returns the config subcommand class for config', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('config')

    expect(Subcommand).toBe(GitConfigSubcommand)
  })

  it('returns the stash subcommand class for stash', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('stash')

    expect(Subcommand).toBe(GitStashSubcommand)
  })

  it('returns the worktree subcommand class for worktree', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('worktree')

    expect(Subcommand).toBe(GitWorktreeSubcommand)
  })

  it('returns the reflog subcommand class for reflog', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('reflog')

    expect(Subcommand).toBe(GitReflogSubcommand)
  })

  it('returns a class refusing push and listing the allowed subcommands', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('push')

    expect(
      new Subcommand({
        applicationData: mockApplicationData(),
        operationArguments: { args: [] },
      }).refusal(),
    ).toBe(
      'subcommand not allowed: push; allowed subcommands: blame, branch, cat-file, check-attr, check-ignore, config, count-objects, describe, diff, for-each-ref, grep, log, ls-files, ls-tree, merge-base, name-rev, reflog, remote, rev-list, rev-parse, show, show-ref, stash, status, tag, worktree',
    )
  })

  it('returns a refusing class for inherited object keys', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('constructor')

    expect(
      new Subcommand({
        applicationData: mockApplicationData(),
        operationArguments: { args: [] },
      }).refusal(),
    ).toBe(
      'subcommand not allowed: constructor; allowed subcommands: blame, branch, cat-file, check-attr, check-ignore, config, count-objects, describe, diff, for-each-ref, grep, log, ls-files, ls-tree, merge-base, name-rev, reflog, remote, rev-list, rev-parse, show, show-ref, stash, status, tag, worktree',
    )
  })
})

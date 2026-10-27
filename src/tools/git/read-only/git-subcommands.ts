import type { GitSubcommandClass } from '../../types.ts'
import { GitRefusals } from './git-subcommands/git-refusals.ts'
import { nullSubcommand } from './subcommands/null-subcommand.ts'
import { GitBlameSubcommand } from './subcommands/blame.ts'
import { GitBranchSubcommand } from './subcommands/branch.ts'
import { GitCatFileSubcommand } from './subcommands/cat-file.ts'
import { GitCheckAttrSubcommand } from './subcommands/check-attr.ts'
import { GitCheckIgnoreSubcommand } from './subcommands/check-ignore.ts'
import { GitConfigSubcommand } from './subcommands/config.ts'
import { GitCountObjectsSubcommand } from './subcommands/count-objects.ts'
import { GitDescribeSubcommand } from './subcommands/describe.ts'
import { GitDiffSubcommand } from './subcommands/diff.ts'
import { GitForEachRefSubcommand } from './subcommands/for-each-ref.ts'
import { GitGrepSubcommand } from './subcommands/grep.ts'
import { GitLogSubcommand } from './subcommands/log.ts'
import { GitLsFilesSubcommand } from './subcommands/ls-files.ts'
import { GitLsTreeSubcommand } from './subcommands/ls-tree.ts'
import { GitMergeBaseSubcommand } from './subcommands/merge-base.ts'
import { GitNameRevSubcommand } from './subcommands/name-rev.ts'
import { GitReflogSubcommand } from './subcommands/reflog.ts'
import { GitRemoteSubcommand } from './subcommands/remote.ts'
import { GitRevListSubcommand } from './subcommands/rev-list.ts'
import { GitRevParseSubcommand } from './subcommands/rev-parse.ts'
import { GitShowRefSubcommand } from './subcommands/show-ref.ts'
import { GitShowSubcommand } from './subcommands/show.ts'
import { GitStashSubcommand } from './subcommands/stash.ts'
import { GitStatusSubcommand } from './subcommands/status.ts'
import { GitTagSubcommand } from './subcommands/tag.ts'
import { GitWorktreeSubcommand } from './subcommands/worktree.ts'

export class GitSubcommands {
  private registry: Record<string, GitSubcommandClass> = {
    log: GitLogSubcommand,
    show: GitShowSubcommand,
    diff: GitDiffSubcommand,
    blame: GitBlameSubcommand,
    status: GitStatusSubcommand,
    'ls-files': GitLsFilesSubcommand,
    'ls-tree': GitLsTreeSubcommand,
    'rev-parse': GitRevParseSubcommand,
    'rev-list': GitRevListSubcommand,
    'merge-base': GitMergeBaseSubcommand,
    describe: GitDescribeSubcommand,
    'name-rev': GitNameRevSubcommand,
    'cat-file': GitCatFileSubcommand,
    'count-objects': GitCountObjectsSubcommand,
    'show-ref': GitShowRefSubcommand,
    'for-each-ref': GitForEachRefSubcommand,
    'check-ignore': GitCheckIgnoreSubcommand,
    'check-attr': GitCheckAttrSubcommand,
    grep: GitGrepSubcommand,
    branch: GitBranchSubcommand,
    tag: GitTagSubcommand,
    remote: GitRemoteSubcommand,
    config: GitConfigSubcommand,
    stash: GitStashSubcommand,
    worktree: GitWorktreeSubcommand,
    reflog: GitReflogSubcommand,
  }
  private refusals = new GitRefusals()

  classFor(name: string) {
    if (this.isKnown(name)) return this.registry[name]
    return this.nullClass(name)
  }

  private isKnown(name: string) {
    return Object.hasOwn(this.registry, name)
  }

  private allowedNames() {
    return Object.keys(this.registry)
  }

  private refusalFor(name: string) {
    return this.refusals.unknownSubcommand(name, this.allowedNames())
  }

  private nullClass(requested: string) {
    return nullSubcommand(requested, this.refusalFor(requested))
  }
}

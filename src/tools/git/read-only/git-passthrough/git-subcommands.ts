import type { GitSubcommandClass } from '../../../types.ts'
import { GitRefusals } from './git-refusals.ts'
import { nullSubcommand } from './null-subcommand.ts'
import { GitBlameSubcommand } from './subcommands/blame.ts'
import { GitDiffSubcommand } from './subcommands/diff.ts'
import { GitLogSubcommand } from './subcommands/log.ts'
import { GitShowSubcommand } from './subcommands/show.ts'

export class GitSubcommands {
  private registry: Record<string, GitSubcommandClass> = {
    log: GitLogSubcommand,
    show: GitShowSubcommand,
    diff: GitDiffSubcommand,
    blame: GitBlameSubcommand,
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

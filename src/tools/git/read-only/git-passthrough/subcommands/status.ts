import { gitOptionFlags } from '../cli-options/option-flags.ts'
import { GitSubcommand } from '../git-subcommand.ts'
import { GitStatusPorcelainParser } from './status/porcelain-parser.ts'

export class GitStatusSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git status: '
  readonly name = 'status'
  readonly flags = {
    '--porcelain=v2': 'boolean',
    '-s': 'boolean',
    '-b': 'boolean',
    '--untracked-files=all': 'boolean',
  } as const

  protected override parse() {
    if (!this.porcelainParser().isMatch()) return
    return this.porcelainParser().parse()
  }

  private porcelainParser() {
    return new GitStatusPorcelainParser(this.options(), this.rawResponse)
  }

  private options() {
    return gitOptionFlags(this.args)
  }
}

import { gitOptionFlags } from '../cli-options/option-flags.ts'
import { GitSubcommand } from '../git-subcommand.ts'
import { GitNameRevParser } from './name-rev/parser.ts'

export class GitNameRevSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git name-rev: '
  readonly name = 'name-rev'
  readonly flags = {
    '--name-only': 'boolean',
    '--tags': 'boolean',
  } as const

  protected override parse() {
    return new GitNameRevParser(gitOptionFlags(this.args)).parse(
      this.rawResponse,
    )
  }
}

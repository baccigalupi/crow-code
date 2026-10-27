import { GitSubcommand } from '../git-subcommand.ts'
import { GitCheckAttrParser } from './check-attr/parser.ts'

export class GitCheckAttrSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git check-attr: '
  readonly name = 'check-attr'
  readonly flags = {
    '-a': 'boolean',
    '--all': 'boolean',
  } as const

  protected override parse() {
    return new GitCheckAttrParser(this.rawResponse).parse()
  }
}

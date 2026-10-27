import { GitSubcommand } from '../git-subcommand.ts'
import { GitCheckIgnoreParser } from './check-ignore/parser.ts'

export class GitCheckIgnoreSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git check-ignore: '
  readonly name = 'check-ignore'
  readonly flags = {
    '-v': 'boolean',
  } as const

  protected override parse() {
    return new GitCheckIgnoreParser(this.rawResponse).parse()
  }
}

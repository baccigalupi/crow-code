import { GitSubcommand } from '../git-subcommand.ts'
import { GitCountObjectsParser } from './count-objects/parser.ts'

export class GitCountObjectsSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git count-objects: '
  readonly name = 'count-objects'
  readonly flags = {
    '-v': 'boolean',
  } as const

  protected override parse() {
    return new GitCountObjectsParser(this.rawResponse).parse()
  }
}

import { gitOptionFlags } from '../cli-options/option-flags.ts'
import { GitSubcommand } from '../git-subcommand.ts'
import { GitRevListCountParser } from './rev-list/count-parser.ts'
import { GitRevListObjectsParser } from './rev-list/objects-parser.ts'
import { GitRevListParser } from './rev-list/parser.ts'

export class GitRevListSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git rev-list: '
  readonly name = 'rev-list'
  readonly flags = {
    '--count': 'boolean',
    '--objects': 'boolean',
    '--all': 'boolean',
  } as const

  protected override parse() {
    return this.parser().parse(this.rawResponse)
  }

  private parser() {
    const matched = this.flagParsers().find((parser) => parser.isMatch())
    return matched || new GitRevListParser()
  }

  private flagParsers() {
    const options = this.options()
    return [
      new GitRevListCountParser(options),
      new GitRevListObjectsParser(options),
    ]
  }

  private options() {
    return gitOptionFlags(this.args)
  }
}

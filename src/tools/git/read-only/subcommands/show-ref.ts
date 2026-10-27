import { gitOptionFlags } from '../cli-options/option-flags.ts'
import { GitSubcommand } from '../git-subcommand.ts'
import { GitShowRefHashParser } from './show-ref/hash-parser.ts'
import { GitShowRefParser } from './show-ref/parser.ts'

export class GitShowRefSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git show-ref: '
  readonly name = 'show-ref'
  readonly flags = {
    '--tags': 'boolean',
    '--heads': 'boolean',
    '--verify': 'boolean',
    '--head': 'boolean',
    '-d': 'boolean',
    '--dereference': 'boolean',
    '-s': 'boolean',
    '--hash': 'boolean',
    '--abbrev': 'boolean',
    '-q': 'boolean',
    '--quiet': 'boolean',
  } as const

  protected override parse() {
    return this.parser().parse()
  }

  private parser() {
    if (this.hashParser().isMatch()) return this.hashParser()
    return new GitShowRefParser(this.rawResponse)
  }

  private hashParser() {
    const options = gitOptionFlags(this.args)
    return new GitShowRefHashParser(options, this.rawResponse)
  }
}

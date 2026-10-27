import { gitOptionFlags } from '../cli-options/option-flags.ts'
import { GitSubcommand } from '../git-subcommand.ts'
import { GitLsTreeNameOnlyParser } from './ls-tree/name-only-parser.ts'
import { GitLsTreeParser } from './ls-tree/parser.ts'

export class GitLsTreeSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git ls-tree: '
  readonly name = 'ls-tree'
  readonly flags = {
    '-r': 'boolean',
    '--name-only': 'boolean',
  } as const

  protected override parse() {
    return this.parser().parse()
  }

  private parser() {
    const nameOnlyParser = this.nameOnlyParser()
    if (nameOnlyParser.isMatch()) {
      return nameOnlyParser
    } else {
      return new GitLsTreeParser(this.rawResponse)
    }
  }

  private nameOnlyParser() {
    return new GitLsTreeNameOnlyParser(this.options(), this.rawResponse)
  }

  private options() {
    return gitOptionFlags(this.args)
  }
}

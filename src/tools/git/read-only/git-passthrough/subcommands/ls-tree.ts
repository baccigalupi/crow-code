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
    return this.parser().parse(this.rawResponse)
  }

  private parser() {
    const nameOnlyParser = new GitLsTreeNameOnlyParser(this.options())
    if (nameOnlyParser.isMatch()) {
      return nameOnlyParser
    } else {
      return new GitLsTreeParser()
    }
  }

  private options() {
    return gitOptionFlags(this.args)
  }
}

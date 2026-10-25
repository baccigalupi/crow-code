import { gitOptionFlags } from '../cli-options/option-flags.ts'
import { GitSubcommand } from '../git-subcommand.ts'
import { GitLsFilesParser } from './ls-files/parser.ts'

export class GitLsFilesSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git ls-files: '
  readonly name = 'ls-files'
  readonly flags = {
    '-s': 'boolean',
    '-m': 'boolean',
    '-o': 'boolean',
    '--others': 'boolean',
    '--exclude-standard': 'boolean',
    '-z': 'boolean',
  } as const

  protected override parse() {
    return new GitLsFilesParser(this.options()).parse(this.rawResponse)
  }

  private options() {
    return gitOptionFlags(this.args)
  }
}

import { gitOptionFlags } from '../cli-options/option-flags.ts'
import { GitSubcommand } from '../git-subcommand.ts'
import { GitForEachRefParser } from './for-each-ref/parser.ts'

export class GitForEachRefSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git for-each-ref: '
  readonly name = 'for-each-ref'
  readonly flags = {
    '--format': 'text',
    '--sort': 'text',
    '--points-at': 'text',
    '--merged': 'text',
    '--no-merged': 'text',
    '--contains': 'text',
    '--no-contains': 'text',
    '--count': 'number',
    '--ignore-case': 'boolean',
    '-s': 'boolean',
    '--shell': 'boolean',
    '-p': 'boolean',
    '--perl': 'boolean',
    '--python': 'boolean',
    '--tcl': 'boolean',
  } as const

  private customOutputFlags = [
    '--format',
    '-s',
    '--shell',
    '-p',
    '--perl',
    '--python',
    '--tcl',
  ]

  protected override parse() {
    if (this.isCustomOutput()) return
    return new GitForEachRefParser(this.rawResponse).parse()
  }

  private isCustomOutput() {
    const options = gitOptionFlags(this.args)
    return options.some((option) => this.isCustomOutputFlag(option))
  }

  private isCustomOutputFlag(option: string) {
    const flag = option.replace(/=.*$/, '')
    return this.customOutputFlags.includes(flag)
  }
}

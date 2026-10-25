import { GitSubcommand } from '../git-subcommand.ts'

export class GitRevParseSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git rev-parse: '
  readonly name = 'rev-parse'
  readonly flags = {
    '--show-toplevel': 'boolean',
    '--abbrev-ref': 'boolean',
    '--short': 'boolean',
    '--verify': 'boolean',
    '--is-inside-work-tree': 'boolean',
  } as const

  protected override parse() {
    return {
      values: this.rawResponse.split('\n').filter((line) => line !== ''),
    }
  }
}

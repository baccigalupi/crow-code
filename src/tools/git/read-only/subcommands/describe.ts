import { GitSubcommand } from '../git-subcommand.ts'

export class GitDescribeSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git describe: '
  readonly name = 'describe'
  readonly flags = {} as const

  protected override parse() {
    return { name: this.rawResponse.trim() }
  }
}

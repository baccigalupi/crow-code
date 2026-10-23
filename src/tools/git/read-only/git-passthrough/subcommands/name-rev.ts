import { GitSubcommand } from '../git-subcommand.ts'

export class GitNameRevSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git name-rev: '
  readonly name = 'name-rev'
  readonly flags = {
    '--name-only': 'boolean',
    '--tags': 'boolean',
  } as const
}

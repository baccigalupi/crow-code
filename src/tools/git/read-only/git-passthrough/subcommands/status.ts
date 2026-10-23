import { GitSubcommand } from '../git-subcommand.ts'

export class GitStatusSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git status: '
  readonly name = 'status'
  readonly flags = {
    '--porcelain=v2': 'boolean',
    '-s': 'boolean',
    '-b': 'boolean',
  } as const
}

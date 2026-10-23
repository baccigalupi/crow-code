import { GitSubcommand } from '../git-subcommand.ts'

export class GitStatusSubcommand extends GitSubcommand {
  readonly name = 'status'
  readonly flags = {
    '--porcelain=v2': 'boolean',
    '-s': 'boolean',
    '-b': 'boolean',
  } as const
}

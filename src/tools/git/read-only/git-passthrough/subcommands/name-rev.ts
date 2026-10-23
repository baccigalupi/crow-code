import { GitSubcommand } from '../git-subcommand.ts'

export class GitNameRevSubcommand extends GitSubcommand {
  readonly name = 'name-rev'
  readonly flags = {
    '--name-only': 'boolean',
    '--tags': 'boolean',
  } as const
}

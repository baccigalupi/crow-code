import { GitSubcommand } from '../git-subcommand.ts'

export class GitShowSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git show: '
  readonly name = 'show'
  readonly flags = {
    '--stat': 'boolean',
    '--name-only': 'boolean',
    '--format': 'text',
  } as const
}

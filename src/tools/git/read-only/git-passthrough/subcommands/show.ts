import { GitSubcommand } from '../git-subcommand.ts'

export class GitShowSubcommand extends GitSubcommand {
  readonly name = 'show'
  readonly flags = {
    '--stat': 'switch',
    '--name-only': 'switch',
    '--format': 'text',
  } as const
}

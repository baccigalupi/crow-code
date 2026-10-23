import { GitSubcommand } from '../git-subcommand.ts'

export class GitLogSubcommand extends GitSubcommand {
  readonly name = 'log'
  readonly flags = {
    '--oneline': 'boolean',
    '--stat': 'boolean',
    '--name-only': 'boolean',
    '--name-status': 'boolean',
    '--follow': 'boolean',
    '--no-merges': 'boolean',
    '--format': 'text',
    '-n': 'number',
    '-p': 'boolean',
  } as const
}

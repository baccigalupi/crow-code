import { GitSubcommand } from '../git-subcommand.ts'

export class GitLogSubcommand extends GitSubcommand {
  readonly name = 'log'
  readonly flags = {
    '--oneline': 'switch',
    '--stat': 'switch',
    '--name-only': 'switch',
    '--name-status': 'switch',
    '--follow': 'switch',
    '--no-merges': 'switch',
    '--format': 'text',
    '-n': 'number',
    '-p': 'switch',
  } as const
}

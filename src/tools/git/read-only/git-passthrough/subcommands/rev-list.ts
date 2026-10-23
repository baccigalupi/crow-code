import { GitSubcommand } from '../git-subcommand.ts'

export class GitRevListSubcommand extends GitSubcommand {
  readonly name = 'rev-list'
  readonly flags = {
    '--count': 'boolean',
    '--objects': 'boolean',
    '--all': 'boolean',
  } as const
}

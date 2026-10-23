import { GitSubcommand } from '../git-subcommand.ts'

export class GitRevListSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git rev-list: '
  readonly name = 'rev-list'
  readonly flags = {
    '--count': 'boolean',
    '--objects': 'boolean',
    '--all': 'boolean',
  } as const
}

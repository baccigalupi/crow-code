import { GitSubcommand } from '../git-subcommand.ts'

export class GitLsTreeSubcommand extends GitSubcommand {
  readonly name = 'ls-tree'
  readonly flags = {
    '-r': 'boolean',
    '--name-only': 'boolean',
  } as const
}

import { GitSubcommand } from '../git-subcommand.ts'

export class GitLsTreeSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git ls-tree: '
  readonly name = 'ls-tree'
  readonly flags = {
    '-r': 'boolean',
    '--name-only': 'boolean',
  } as const
}

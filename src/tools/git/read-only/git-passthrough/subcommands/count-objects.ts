import { GitSubcommand } from '../git-subcommand.ts'

export class GitCountObjectsSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git count-objects: '
  readonly name = 'count-objects'
  readonly flags = {
    '-v': 'boolean',
  } as const
}

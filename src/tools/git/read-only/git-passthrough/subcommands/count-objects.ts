import { GitSubcommand } from '../git-subcommand.ts'

export class GitCountObjectsSubcommand extends GitSubcommand {
  readonly name = 'count-objects'
  readonly flags = {
    '-v': 'boolean',
  } as const
}

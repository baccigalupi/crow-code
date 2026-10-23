import { GitSubcommand } from '../git-subcommand.ts'

export class GitCheckIgnoreSubcommand extends GitSubcommand {
  readonly name = 'check-ignore'
  readonly flags = {
    '-v': 'boolean',
  } as const
}

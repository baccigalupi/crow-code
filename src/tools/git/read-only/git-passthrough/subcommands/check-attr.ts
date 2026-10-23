import { GitSubcommand } from '../git-subcommand.ts'

export class GitCheckAttrSubcommand extends GitSubcommand {
  readonly name = 'check-attr'
  readonly flags = {
    '-a': 'boolean',
    '--all': 'boolean',
  } as const
}

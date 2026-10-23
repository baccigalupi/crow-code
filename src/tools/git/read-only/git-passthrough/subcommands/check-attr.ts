import { GitSubcommand } from '../git-subcommand.ts'

export class GitCheckAttrSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git check-attr: '
  readonly name = 'check-attr'
  readonly flags = {
    '-a': 'boolean',
    '--all': 'boolean',
  } as const
}

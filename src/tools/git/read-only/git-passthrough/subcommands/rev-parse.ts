import { GitSubcommand } from '../git-subcommand.ts'

export class GitRevParseSubcommand extends GitSubcommand {
  readonly name = 'rev-parse'
  readonly flags = {
    '--show-toplevel': 'boolean',
    '--abbrev-ref': 'boolean',
    '--short': 'boolean',
    '--verify': 'boolean',
    '--is-inside-work-tree': 'boolean',
  } as const
}

import { GitSubcommand } from '../git-subcommand.ts'

export class GitShowRefSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git show-ref: '
  readonly name = 'show-ref'
  readonly flags = {
    '--tags': 'boolean',
    '--heads': 'boolean',
    '--verify': 'boolean',
    '--head': 'boolean',
    '-d': 'boolean',
    '--dereference': 'boolean',
    '-s': 'boolean',
    '--hash': 'boolean',
    '--abbrev': 'boolean',
    '-q': 'boolean',
    '--quiet': 'boolean',
  } as const
}

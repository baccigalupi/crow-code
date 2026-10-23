import { GitSubcommand } from '../git-subcommand.ts'

export class GitForEachRefSubcommand extends GitSubcommand {
  readonly name = 'for-each-ref'
  readonly flags = {
    '--format': 'text',
    '--sort': 'text',
    '--points-at': 'text',
    '--merged': 'text',
    '--no-merged': 'text',
    '--contains': 'text',
    '--no-contains': 'text',
    '--count': 'number',
    '--ignore-case': 'boolean',
    '-s': 'boolean',
    '--shell': 'boolean',
    '-p': 'boolean',
    '--perl': 'boolean',
    '--python': 'boolean',
    '--tcl': 'boolean',
  } as const
}

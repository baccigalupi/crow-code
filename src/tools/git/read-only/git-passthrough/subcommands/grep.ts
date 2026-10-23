import { GitSubcommand } from '../git-subcommand.ts'

export class GitGrepSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git grep: '
  readonly name = 'grep'
  readonly flags = {
    '-n': 'boolean',
    '-i': 'boolean',
    '-w': 'boolean',
    '-F': 'boolean',
    '-E': 'boolean',
    '-l': 'boolean',
    '-c': 'boolean',
    '-e': 'text',
  } as const
}

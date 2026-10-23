import { GitSubcommand } from '../git-subcommand.ts'

export class GitCatFileSubcommand extends GitSubcommand {
  readonly name = 'cat-file'
  readonly flags = {
    '-p': 'boolean',
    '-t': 'boolean',
    '-s': 'boolean',
    '-e': 'boolean',
  } as const
}

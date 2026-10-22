import { GitSubcommand } from '../git-subcommand.ts'

export class GitBlameSubcommand extends GitSubcommand {
  readonly name = 'blame'
  readonly flags = {
    '-L': 'text',
    '-w': 'switch',
    '--porcelain': 'switch',
    '--contents': 'path',
  } as const
}

import { GitSubcommand } from '../git-subcommand.ts'

export class GitBlameSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git blame: '
  readonly name = 'blame'
  readonly flags = {
    '-L': 'text',
    '-w': 'boolean',
    '--porcelain': 'boolean',
    '--contents': 'path',
  } as const
}

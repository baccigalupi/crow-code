import { GitSubcommand } from '../git-subcommand.ts'

export class GitDiffSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git diff: '
  readonly name = 'diff'
  override readonly fixedFlags = ['--no-ext-diff', '--no-textconv']
  readonly flags = {
    '--cached': 'boolean',
    '--stat': 'boolean',
    '--name-only': 'boolean',
    '--name-status': 'boolean',
    '-U': 'number',
  } as const
}

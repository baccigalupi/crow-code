import { GitSubcommand } from '../git-subcommand.ts'

export class GitDiffSubcommand extends GitSubcommand {
  readonly name = 'diff'
  override readonly fixedFlags = ['--no-ext-diff', '--no-textconv']
  readonly flags = {
    '--cached': 'switch',
    '--stat': 'switch',
    '--name-only': 'switch',
    '--name-status': 'switch',
    '-U': 'number',
  } as const
}

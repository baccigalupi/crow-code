import { GitSubcommand } from '../git-subcommand.ts'

export class GitMergeBaseSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git merge-base: '
  readonly name = 'merge-base'
  readonly flags = {
    '--all': 'boolean',
    '--octopus': 'boolean',
    '--independent': 'boolean',
    '--is-ancestor': 'boolean',
    '--fork-point': 'boolean',
  } as const
}

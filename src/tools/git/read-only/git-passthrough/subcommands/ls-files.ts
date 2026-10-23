import { GitSubcommand } from '../git-subcommand.ts'

export class GitLsFilesSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git ls-files: '
  readonly name = 'ls-files'
  readonly flags = {
    '-s': 'boolean',
    '-m': 'boolean',
    '-o': 'boolean',
    '--others': 'boolean',
    '--exclude-standard': 'boolean',
    '-z': 'boolean',
  } as const
}

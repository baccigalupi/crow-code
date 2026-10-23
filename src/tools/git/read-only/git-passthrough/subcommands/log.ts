import type { GitLogShape } from '../../../../types.ts'
import { GitSubcommand } from '../git-subcommand.ts'
import { GitLogCommits } from './log/commits.ts'

const format = '--format=%H%x1f%an%x1f%aI%x1f%s'

const shapes: [string[], GitLogShape][] = [
  [['--name-status'], 'name-status'],
  [['--name-only'], 'name-only'],
  [['--stat', '-p'], 'stat-patch'],
  [['--stat'], 'stat'],
  [['-p'], 'patch'],
]

export class GitLogSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git log: '
  readonly name = 'log'
  readonly flags = {
    '--oneline': 'boolean',
    '--stat': 'boolean',
    '--name-only': 'boolean',
    '--name-status': 'boolean',
    '--follow': 'boolean',
    '--no-merges': 'boolean',
    '--format': 'text',
    '-n': 'number',
    '-p': 'boolean',
  } as const

  override gitArguments() {
    const pathspecs = this.args.slice(this.options().length)
    return [this.name, ...this.options(), format, ...pathspecs]
  }

  protected override parse() {
    const stdout = this.rawResponse
    const commits = new GitLogCommits({ stdout, shape: this.shape() })
    return { commits: commits.commits() }
  }

  private shape() {
    const [, shape = 'none'] =
      shapes.find(([flags]) => flags.every((flag) => this.hasOption(flag))) ||
      []
    return shape
  }

  private hasOption(flag: string) {
    return this.options().includes(flag)
  }

  private options() {
    return this.args.slice(0, [...this.args, '--'].indexOf('--'))
  }
}

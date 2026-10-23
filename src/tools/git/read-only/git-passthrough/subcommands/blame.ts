import { GitSubcommand } from '../git-subcommand.ts'
import { GitBlameParser } from './blame/parser.ts'

export class GitBlameSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git blame: '
  readonly name = 'blame'
  override readonly fixedFlags = ['--line-porcelain']
  readonly flags = {
    '-L': 'text',
    '-w': 'boolean',
    '--porcelain': 'boolean',
    '--contents': 'path',
  } as const

  protected override parse() {
    return new GitBlameParser().parse(this.rawResponse)
  }
}

import { GitSubcommand } from '../git-subcommand.ts'
import { GitDiffPatchParser } from './diff/patch-parser.ts'
import { GitShowContentParser } from './show/content-parser.ts'

export class GitShowSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git show: '
  readonly name = 'show'
  override readonly fixedFlags = ['--no-ext-diff', '--no-textconv']
  readonly flags = {
    '--stat': 'boolean',
    '--name-only': 'boolean',
    '--format': 'text',
  } as const

  protected override parse() {
    if (this.isSummary()) return
    return this.parseContent()
  }

  private parseContent() {
    const contentParser = new GitShowContentParser(this.options())
    if (contentParser.isMatch()) {
      return contentParser.parse(this.rawResponse)
    } else {
      return new GitDiffPatchParser().parse(this.rawResponse)
    }
  }

  private isSummary() {
    const options = this.options()
    return options.includes('--stat') || options.includes('--name-only')
  }

  private options() {
    return this.args.slice(0, [...this.args, '--'].indexOf('--'))
  }
}

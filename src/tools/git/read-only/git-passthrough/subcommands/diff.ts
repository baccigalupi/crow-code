import { gitOptionFlags } from '../cli-options/option-flags.ts'
import { GitSubcommand } from '../git-subcommand.ts'
import { GitDiffNameOnlyParser } from './diff/name-only-parser.ts'
import { GitDiffNameStatusParser } from './diff/name-status-parser.ts'
import { GitDiffPatchParser } from './diff/patch-parser.ts'
import { GitDiffStatParser } from './diff/stat-parser.ts'

export class GitDiffSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git diff: '
  readonly name = 'diff'
  override readonly fixedFlags = ['--no-ext-diff', '--no-textconv']
  private parserClasses = [
    GitDiffNameStatusParser,
    GitDiffNameOnlyParser,
    GitDiffStatParser,
  ]
  readonly flags = {
    '--cached': 'boolean',
    '--stat': 'boolean',
    '--name-only': 'boolean',
    '--name-status': 'boolean',
    '-U': 'number',
  } as const

  protected override parse() {
    return this.parser().parse(this.rawResponse)
  }

  private parser() {
    const match = this.parsers().find((parser) => parser.isMatch())
    return match || new GitDiffPatchParser()
  }

  private parsers() {
    return this.parserClasses.map((Parser) => new Parser(this.options()))
  }

  private options() {
    return gitOptionFlags(this.args)
  }
}

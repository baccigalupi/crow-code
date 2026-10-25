import { gitOptionFlags } from '../cli-options/option-flags.ts'
import { GitSubcommand } from '../git-subcommand.ts'
import { GitLogNameOnlyParser } from './log/name-only-parser.ts'
import { GitLogNameStatusParser } from './log/name-status-parser.ts'
import { GitLogPatchParser } from './log/patch-parser.ts'
import { GitLogPlainParser } from './log/plain-parser.ts'
import { GitLogStatParser } from './log/stat-parser.ts'
import { GitLogStatPatchParser } from './log/stat-patch-parser.ts'

export class GitLogSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git log: '
  readonly name = 'log'
  private format = '--format=%H%x1f%an%x1f%aI%x1f%s'
  private parserClasses = [
    GitLogNameStatusParser,
    GitLogNameOnlyParser,
    GitLogStatPatchParser,
    GitLogStatParser,
    GitLogPatchParser,
  ]
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
    return [this.name, ...this.options(), this.format, ...pathspecs]
  }

  protected override parse() {
    return this.parser().parse(this.rawResponse)
  }

  private parser() {
    const match = this.parsers().find((parser) => parser.isMatch())
    return match || new GitLogPlainParser()
  }

  private parsers() {
    return this.parserClasses.map((Parser) => new Parser(this.options()))
  }

  private options() {
    return gitOptionFlags(this.args)
  }
}

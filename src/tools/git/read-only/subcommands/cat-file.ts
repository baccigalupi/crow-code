import { gitOptionFlags } from '../cli-options/option-flags.ts'
import { GitSubcommand } from '../git-subcommand.ts'
import { GitCatFilePrintParser } from './cat-file/print-parser.ts'
import { GitCatFileSizeParser } from './cat-file/size-parser.ts'
import { GitCatFileTypeParser } from './cat-file/type-parser.ts'

export class GitCatFileSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git cat-file: '
  readonly name = 'cat-file'
  readonly flags = {
    '-p': 'boolean',
    '-t': 'boolean',
    '-s': 'boolean',
    '-e': 'boolean',
  } as const

  protected override parse() {
    const matched = this.flagParsers().find((parser) => parser.isMatch())
    return matched && matched.parse()
  }

  private flagParsers() {
    const options = gitOptionFlags(this.args)
    return [
      new GitCatFileTypeParser(options, this.rawResponse),
      new GitCatFileSizeParser(options, this.rawResponse),
      new GitCatFilePrintParser(options, this.rawResponse),
    ]
  }
}

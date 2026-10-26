import { gitOptionFlags } from '../cli-options/option-flags.ts'
import { GitSubcommand } from '../git-subcommand.ts'
import { GitGrepCountParser } from './grep/count-parser.ts'
import { GitGrepMatchParser } from './grep/match-parser.ts'

export class GitGrepSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git grep: '
  readonly name = 'grep'
  readonly flags = {
    '-n': 'boolean',
    '-i': 'boolean',
    '-w': 'boolean',
    '-F': 'boolean',
    '-E': 'boolean',
    '-l': 'boolean',
    '-c': 'boolean',
    '-e': 'text',
  } as const

  protected override parse() {
    const matched = this.parsers().find((parser) => parser.isMatch())
    return matched && matched.parse()
  }

  private parsers() {
    const options = gitOptionFlags(this.args)
    return [
      new GitGrepCountParser(options, this.rawResponse),
      new GitGrepMatchParser(options, this.rawResponse),
    ]
  }
}

import { gitParsedArguments } from '../cli-options/parsed-arguments.ts'
import { GitRefusals } from '../git-subcommands/git-refusals.ts'
import { GitSubcommand } from '../git-subcommand.ts'

export class GitTagSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git tag: '
  readonly name = 'tag'
  readonly flags = {
    '-l': 'boolean',
    '--list': 'boolean',
    '-n': 'boolean',
    '--points-at': 'text',
    '--contains': 'text',
  } as const
  private argumentRefusals = new GitRefusals()

  override refusal() {
    return this.parsed().refusal() || this.extrasRefusal()
  }

  private parsed() {
    const values = this.gitArguments().slice(1)
    return gitParsedArguments({ name: this.name, flags: this.flags, values })
  }

  private extras() {
    const parsed = this.parsed()
    return [...parsed.positionals, ...parsed.pathspecs]
  }

  private extrasRefusal() {
    if (this.extras().length === 0) return ''
    return this.argumentRefusals.argumentNotAllowed(this.extras())
  }
}

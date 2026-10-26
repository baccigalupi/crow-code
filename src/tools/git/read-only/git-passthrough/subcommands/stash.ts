import { gitParsedArguments } from '../cli-options/parsed-arguments.ts'
import { GitRefusals } from '../git-subcommands/git-refusals.ts'
import { GitSubcommand } from '../git-subcommand.ts'
import { GitStashParser } from './stash/parser.ts'

export class GitStashSubcommand extends GitSubcommand {
  protected override logPrefix = 'Git stash: '
  readonly name = 'stash'
  override readonly forms = ['list']
  readonly flags = {}
  private argumentRefusals = new GitRefusals()

  override refusal() {
    return (
      this.formsRefusal() || this.parsed().refusal() || this.extrasRefusal()
    )
  }

  protected override parse() {
    return new GitStashParser(this.rawResponse).parse()
  }

  private given() {
    return this.gitArguments().slice(1)
  }

  private formsRefusal() {
    if (this.forms.includes(`${this.given()[0]}`)) return ''
    const attempted = [this.name, ...this.given().slice(0, 1)].join(' ')
    return this.argumentRefusals.formNotAllowed(
      attempted,
      this.name,
      this.forms,
    )
  }

  private parsed() {
    const values = this.given().slice(1)
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

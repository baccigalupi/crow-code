import { gitParsedArguments } from '../cli-options/parsed-arguments.ts'
import { GitRefusals } from '../git-refusals.ts'
import { GitSubcommand } from '../git-subcommand.ts'

export class GitReflogSubcommand extends GitSubcommand {
  readonly name = 'reflog'
  override readonly forms = ['show']
  readonly flags = {}
  private argumentRefusals = new GitRefusals()

  override refusal() {
    if (this.given().length === 0) return ''
    return this.formsRefusal() || this.parsed().refusal()
  }

  private given() {
    return this.gitArguments().slice(1)
  }

  private formsRefusal() {
    if (this.forms.includes(`${this.given()[0]}`)) return ''
    const attempted = [this.name, ...this.given().slice(0, 1)].join(' ')
    const allowed = ['(bare)', ...this.forms]
    return this.argumentRefusals.formNotAllowed(attempted, this.name, allowed)
  }

  private parsed() {
    const values = this.given().slice(1)
    return gitParsedArguments({ name: this.name, flags: this.flags, values })
  }
}

import { gitParsedArguments } from '../cli-options/parsed-arguments.ts'
import { GitRefusals } from '../git-refusals.ts'
import { GitSubcommand } from '../git-subcommand.ts'

export class GitRemoteSubcommand extends GitSubcommand {
  readonly name = 'remote'
  override readonly forms = ['-v', 'get-url']
  readonly flags = {}
  private argumentForms = ['get-url']
  private argumentRefusals = new GitRefusals()

  override refusal() {
    if (this.given().length === 0) return ''
    return (
      this.formsRefusal() || this.parsed().refusal() || this.argumentRefusal()
    )
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

  private extras() {
    const parsed = this.parsed()
    return [...parsed.positionals, ...parsed.pathspecs]
  }

  private argumentRefusal() {
    if (this.argumentForms.includes(`${this.given()[0]}`)) return ''
    return this.extrasRefusal()
  }

  private extrasRefusal() {
    if (this.extras().length === 0) return ''
    return this.argumentRefusals.argumentNotAllowed(this.extras())
  }
}

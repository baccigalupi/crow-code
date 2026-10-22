import type { GitFlagKind } from '../../../types.ts'
import { GitFlagValidator } from './cli-flags.ts'
import { GitArgumentPaths } from './cli-paths.ts'
import { GitRefusals } from './git-refusals.ts'

export abstract class GitSubcommand {
  abstract readonly name: string
  abstract readonly flags: Record<string, GitFlagKind>
  readonly fixedFlags: string[] = []
  readonly forms?: string[]
  private args: string[]
  private refusals = new GitRefusals()

  constructor({ args }: { args: string[] }) {
    this.args = args
  }

  gitArguments() {
    return [this.name, ...this.fixedFlags, ...this.args]
  }

  refusal() {
    return this.badForm() || this.flagRefusal()
  }

  requestedPaths() {
    return new GitArgumentPaths(this.validator()).paths()
  }

  private badForm() {
    if (this.forms === undefined) return ''
    return this.formRefusal(this.forms)
  }

  private formRefusal(forms: string[]) {
    if (forms.includes(`${this.args[0]}`)) return ''
    const attempted = [this.name, ...this.args.slice(0, 1)].join(' ')
    return this.refusals.formNotAllowed(attempted, this.name, forms)
  }

  private flagRefusal() {
    const validator = this.validator()
    return this.offenderReason(validator) || this.numberReason(validator)
  }

  private validator() {
    return new GitFlagValidator({
      flags: this.flags,
      values: this.args.slice(this.flagStart()),
    }).validate()
  }

  private flagStart() {
    if (this.forms === undefined) return 0
    return 1
  }

  private offenderReason(validator: GitFlagValidator) {
    if (validator.offenders.length === 0) return ''
    const allowed = Object.keys(this.flags)
    return this.refusals.flagsNotAllowed(
      validator.offenders,
      this.name,
      allowed,
    )
  }

  private numberReason(validator: GitFlagValidator) {
    if (validator.badNumbers.length === 0) return ''
    return this.refusals.valuesNotNumbers(validator.badNumbers)
  }
}

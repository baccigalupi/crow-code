import type { GitSubcommand } from '../../../types.ts'
import { GitFlagValidator } from './git-passthrough-flags.ts'

const listOrNone = (names: string[]) => {
  if (names.length === 0) return 'none'
  return names.sort().join(', ')
}

export class GitReadOnlyRules {
  private enabled: Record<string, GitSubcommand>
  private args: string[]

  constructor({
    enabled,
    args,
  }: {
    enabled: Record<string, GitSubcommand>
    args: string[]
  }) {
    this.enabled = enabled
    this.args = args
  }

  refusal() {
    return this.unknown() || this.badForm() || this.flagRefusal()
  }

  private unknown() {
    if (Object.hasOwn(this.enabled, `${this.args[0]}`)) return ''
    const attempted = this.args[0] || '(none)'
    const allowed = listOrNone(Object.keys(this.enabled))
    return `subcommand not allowed: ${attempted}; allowed subcommands: ${allowed}`
  }

  private badForm() {
    if (this.formAllowed()) return ''
    const attempted = this.args.slice(0, 2).join(' ')
    const forms = listOrNone([...this.forms()])
    return `subcommand not allowed: ${attempted}; allowed forms for ${this.args[0]}: ${forms}`
  }

  private formAllowed() {
    if (this.subcommand().forms === undefined) return true
    return this.forms().includes(`${this.args[1]}`)
  }

  private flagRefusal() {
    const validator = new GitFlagValidator({
      flags: this.subcommand().flags,
      values: this.args.slice(this.flagStart()),
    }).validate()
    return this.offenderReason(validator) || this.numberReason(validator)
  }

  private offenderReason(validator: GitFlagValidator) {
    if (validator.offenders.length === 0) return ''
    const allowed = listOrNone(Object.keys(this.subcommand().flags))
    return `flag not allowed: ${validator.offenders.join(', ')}; allowed flags for ${this.args[0]}: ${allowed}`
  }

  private numberReason(validator: GitFlagValidator) {
    if (validator.badNumbers.length === 0) return ''
    return `flag value not a number: ${validator.badNumbers.join(', ')}`
  }

  private flagStart() {
    if (this.subcommand().forms === undefined) return 1
    return 2
  }

  private forms() {
    return this.subcommand().forms || []
  }

  private subcommand() {
    return this.enabled[this.args[0]]
  }
}

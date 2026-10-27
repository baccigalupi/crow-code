import type { GitFlagReason } from '../../../types.ts'
import { GitRefusals } from '../git-subcommands/git-refusals.ts'
import type { GitFlag } from './flag.ts'

type GitFlagValidatorArguments = {
  name: string
  flags: GitFlag[]
  allowed: string[]
}

export class GitFlagValidator {
  private name: string
  private flags: GitFlag[]
  private allowed: string[]
  private refusals = new GitRefusals()

  constructor({ name, flags, allowed }: GitFlagValidatorArguments) {
    this.name = name
    this.flags = flags
    this.allowed = allowed
  }

  refusal() {
    return this.offenderReason() || this.numberReason()
  }

  private offenderReason() {
    if (this.offenders().length === 0) return ''
    return this.refusals.flagsNotAllowed(
      this.offenders(),
      this.name,
      this.allowed,
    )
  }

  private numberReason() {
    if (this.badNumbers().length === 0) return ''
    return this.refusals.valuesNotNumbers(this.badNumbers())
  }

  private offenders() {
    return [...new Set(this.labelsWith('notAllowed'))]
  }

  private badNumbers() {
    return this.labelsWith('notNumber')
  }

  private labelsWith(reason: GitFlagReason) {
    return this.flags
      .filter((flag) => !flag.isValid() && flag.reason() === reason)
      .map((flag) => flag.label())
  }
}

export const gitFlagValidator = (args: GitFlagValidatorArguments) => {
  return new GitFlagValidator(args)
}

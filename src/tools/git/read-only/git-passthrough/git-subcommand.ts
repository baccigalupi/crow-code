import type { GitFlagKind } from '../../../types.ts'
import { gitParsedArguments } from './cli-options/parsed-arguments.ts'
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
    return this.badForm() || this.parsedArguments().refusal()
  }

  requestedPaths() {
    return this.parsedArguments().paths()
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

  private parsedArguments() {
    return gitParsedArguments({
      name: this.name,
      flags: this.flags,
      values: this.args.slice(this.flagStart()),
    })
  }

  private flagStart() {
    if (this.forms === undefined) return 0
    return 1
  }
}

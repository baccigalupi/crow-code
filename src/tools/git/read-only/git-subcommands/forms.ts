import { GitRefusals } from './git-refusals.ts'

type GitFormsArguments = {
  name: string
  forms?: string[]
  args: string[]
}

export class GitForms {
  private name: string
  private forms?: string[]
  private args: string[]
  private refusals = new GitRefusals()

  constructor({ name, forms, args }: GitFormsArguments) {
    this.name = name
    this.forms = forms
    this.args = args
  }

  refusal() {
    if (this.forms === undefined) return ''
    return this.formRefusal(this.forms)
  }

  flagStart() {
    if (this.forms === undefined) return 0
    return 1
  }

  private formRefusal(forms: string[]) {
    if (forms.includes(`${this.args[0]}`)) return ''
    const attempted = [this.name, ...this.args.slice(0, 1)].join(' ')
    return this.refusals.formNotAllowed(attempted, this.name, forms)
  }
}

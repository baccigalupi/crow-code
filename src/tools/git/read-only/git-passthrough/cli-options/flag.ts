import type { GitFlagReason } from '../../../../types.ts'

type GitFlagArguments = {
  typed: string
  value: string | undefined
}

export abstract class GitFlag {
  protected typed: string
  protected value: string | undefined

  constructor({ typed, value }: GitFlagArguments) {
    this.typed = typed
    this.value = value
  }

  abstract isValid(): boolean

  reason(): GitFlagReason {
    return 'notAllowed'
  }

  label() {
    if (this.value === undefined || this.typed.endsWith(this.value)) {
      return this.typed
    } else {
      return `${this.typed} ${this.value}`
    }
  }

  paths(): string[] {
    return []
  }
}

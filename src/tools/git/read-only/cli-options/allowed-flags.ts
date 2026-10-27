import type { GitFlagKind } from '../../../types.ts'
import { BooleanFlag } from './boolean-flag.ts'
import { ExactFlag } from './exact-flag.ts'
import { NumberFlag } from './number-flag.ts'
import { PathFlag } from './path-flag.ts'
import { TextFlag } from './text-flag.ts'
import { UnknownFlag } from './unknown-flag.ts'

type GitAllowedFlagsArguments = {
  flags: Record<string, GitFlagKind>
}

type GitParsedFlag = {
  name: string
  typed: string
  value: string | undefined
}

export class GitAllowedFlags {
  private kinds = {
    boolean: BooleanFlag,
    text: TextFlag,
    number: NumberFlag,
    path: PathFlag,
  }
  private flags: Record<string, GitFlagKind>

  constructor({ flags }: GitAllowedFlagsArguments) {
    this.flags = flags
  }

  flag(parsed: GitParsedFlag) {
    const Flag = this.flagClass(parsed)
    return new Flag(parsed)
  }

  parseOptions() {
    return Object.fromEntries(
      Object.entries(this.flags).map(([flag, kind]) => [
        this.optionName(flag),
        this.optionConfig(flag, kind),
      ]),
    )
  }

  private flagClass(parsed: GitParsedFlag) {
    if (this.flags[`${parsed.name}=${parsed.value}`] === 'boolean') {
      return ExactFlag
    } else if (this.isUnknown(parsed)) {
      return UnknownFlag
    } else {
      return this.kinds[this.flags[parsed.name]]
    }
  }

  private isUnknown({ name, typed, value }: GitParsedFlag) {
    const grouped = value === undefined && typed !== name
    return this.flags[name] === undefined || grouped
  }

  private optionName(flag: string) {
    return `${flag.replace(/^-+/, '').split('=')[0]}`
  }

  private optionConfig(flag: string, kind: GitFlagKind) {
    const type = this.optionType(flag, kind)
    if (flag.startsWith('--')) {
      return { type }
    } else {
      return { type, short: this.optionName(flag) }
    }
  }

  private optionType(flag: string, kind: GitFlagKind) {
    if (kind === 'boolean' && !flag.includes('=')) {
      return 'boolean' as const
    } else {
      return 'string' as const
    }
  }
}

export const gitAllowedFlags = (args: GitAllowedFlagsArguments) => {
  return new GitAllowedFlags(args)
}

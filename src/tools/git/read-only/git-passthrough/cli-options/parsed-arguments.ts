import { parseArgs } from 'node:util'
import type { GitFlagKind } from '../../../../types.ts'
import { gitAllowedFlags } from './allowed-flags.ts'
import { gitArgumentPaths } from './argument-paths.ts'
import { gitFlagValidator } from './flag-validator.ts'

type GitParsedArgumentsArguments = {
  name: string
  flags: Record<string, GitFlagKind>
  values: string[]
}

type GitOptionToken = {
  rawName: string
  index: number
  value: string | undefined
}

export class GitParsedArguments {
  private name: string
  private allowlist: Record<string, GitFlagKind>
  private values: string[]

  constructor({ name, flags, values }: GitParsedArgumentsArguments) {
    this.name = name
    this.allowlist = flags
    this.values = values
  }

  refusal() {
    const allowed = Object.keys(this.allowlist)
    const flags = this.flags
    return gitFlagValidator({ name: this.name, flags, allowed }).refusal()
  }

  paths() {
    return gitArgumentPaths(this).paths()
  }

  get flags() {
    return this.tokens()
      .filter((token) => token.kind === 'option')
      .map((token) => this.flag(token))
  }

  get flagPaths() {
    return this.flags.flatMap((flag) => flag.paths())
  }

  get positionals() {
    return this.tokens()
      .filter((token) => token.kind === 'positional')
      .map((token) => token.value)
  }

  get pathspecs() {
    return this.values.slice(this.separator() + 1)
  }

  private tokens() {
    return parseArgs({
      args: this.options(),
      options: this.allowed().parseOptions(),
      strict: false,
      allowPositionals: true,
      tokens: true,
    }).tokens
  }

  private flag({ rawName, index, value }: GitOptionToken) {
    const typed = `${this.options()[index]}`
    return this.allowed().flag({ name: rawName, typed, value })
  }

  private allowed() {
    return gitAllowedFlags({ flags: this.allowlist })
  }

  private options() {
    return this.values.slice(0, this.separator())
  }

  private separator() {
    return [...this.values, '--'].indexOf('--')
  }
}

export const gitParsedArguments = (args: GitParsedArgumentsArguments) => {
  return new GitParsedArguments(args)
}

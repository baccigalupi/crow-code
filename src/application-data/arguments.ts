import { parseArgs } from 'node:util'
import type { ParsedArgumentsOptions } from '../cli/types.ts'

export class ParsedArguments {
  commands: string[]
  options: ParsedArgumentsOptions

  constructor(commands: string[], options: ParsedArgumentsOptions) {
    this.commands = commands
    this.options = options
  }

  configPath() {
    if (typeof this.options.config !== 'string') return
    return this.options.config
  }
}

export const parseArguments = (argumentsList: string[]) => {
  const { positionals, values } = parseArgs({
    args: argumentsList,
    options: {},
    strict: false,
    allowPositionals: true,
  })
  return new ParsedArguments(positionals, values as ParsedArgumentsOptions)
}

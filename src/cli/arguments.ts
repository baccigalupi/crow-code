import { parseArgs } from '@std/cli/parse-args'
import type { ParsedArgumentsOptions } from './types.ts'

class ParsedArguments {
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
  const { _, ...options } = parseArgs(argumentsList, { boolean: true })
  return new ParsedArguments(_.map(String), options as ParsedArgumentsOptions)
}

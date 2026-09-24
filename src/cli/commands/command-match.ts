import type { ParsedArguments, ParsedArgumentsOptions } from '../../types.ts'

export abstract class CommandMatch {
  protected commands: string[]
  protected options: ParsedArgumentsOptions

  constructor(parsedArguments: ParsedArguments) {
    this.commands = parsedArguments.commands
    this.options = parsedArguments.options
  }

  abstract isMatch(): boolean
  abstract extractOptions(): ParsedArgumentsOptions
}

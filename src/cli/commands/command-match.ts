import type { ParsedArguments } from '../../types.ts'

export abstract class CommandMatch {
  protected commands: string[]
  protected options: ParsedArguments['options']

  constructor(parsedArguments: ParsedArguments) {
    this.commands = parsedArguments.commands
    this.options = parsedArguments.options
  }

  abstract isMatch(): boolean
}

import { parseArgs } from '@std/cli/parse-args'
import type { ParsedArguments, ParsedArgumentsOptions } from '../types.ts'

export const parseArguments = (argumentsList: string[]): ParsedArguments => {
  const { _, ...options } = parseArgs(argumentsList, { boolean: true })
  return {
    commands: _.map(String),
    options: options as ParsedArgumentsOptions,
  }
}

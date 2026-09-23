import { parseArgs } from '@std/cli/parse-args'

export const parseArguments = (argumentsList: string[]) => {
  const { _, ...options } = parseArgs(argumentsList, { boolean: true })
  return { commands: _.map(String), options }
}

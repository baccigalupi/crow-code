import { parseArgs } from '@std/cli/parse-args'
import type { ParsedArguments } from '../types.ts'

class ArgumentParser {
  private argumentsList: string[]
  private unsupported: string[] = []

  constructor(argumentsList: string[]) {
    this.argumentsList = argumentsList
  }

  parse(): ParsedArguments {
    const parsed = this.parseRawArguments()
    const positionals = this.positionalsFrom(parsed)
    return this.buildResult(parsed, positionals)
  }

  private parseRawArguments() {
    return parseArgs(this.argumentsList, {
      alias: { h: 'help', V: 'version' },
      boolean: ['help', 'version'],
      '--': true,
      unknown: this.collect.bind(this),
    })
  }

  private collect(argument: string) {
    if (!argument.startsWith('-')) return true

    this.unsupported.push(argument)
    return false
  }

  private positionalsFrom(
    parsed: ReturnType<ArgumentParser['parseRawArguments']>,
  ) {
    const { '--': afterDash = [] } = parsed
    return [...parsed._, ...afterDash].map(String)
  }

  private buildResult(
    parsed: ReturnType<ArgumentParser['parseRawArguments']>,
    positionals: string[],
  ) {
    return {
      subcommand: positionals[0] || '',
      goal: positionals.slice(1).join(' ').trim(),
      help: parsed.help === true,
      version: parsed.version === true,
      unsupported: this.unsupported,
    }
  }
}

export const parseArguments = (argumentsList: string[]): ParsedArguments => {
  return new ArgumentParser(argumentsList).parse()
}

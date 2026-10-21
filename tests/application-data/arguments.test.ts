import { describe, expect, it } from 'bun:test'
import { parseArguments } from '../../src/application-data/arguments.ts'

describe('parseArguments', () => {
  it('when given no arguments, returns empty commands and options', () => {
    const argumentsList: string[] = []

    const result = parseArguments(argumentsList)

    expect<unknown>(result).toEqual({ commands: [], options: {} })
    expect(result.configPath()).toBeUndefined()
  })

  it('when given --help, returns a help option', () => {
    const argumentsList = ['--help']

    const result = parseArguments(argumentsList)

    expect<unknown>(result).toEqual({ commands: [], options: { help: true } })
  })

  it('when given -h, returns an h option', () => {
    const argumentsList = ['-h']

    const result = parseArguments(argumentsList)

    expect<unknown>(result).toEqual({ commands: [], options: { h: true } })
  })

  it('when given --key=value, returns the value as a string option', () => {
    const argumentsList = ['--goal=Refactor hallucinatory tests', 'git-commit']

    const result = parseArguments(argumentsList)

    expect<unknown>(result).toEqual({
      commands: ['git-commit'],
      options: { goal: 'Refactor hallucinatory tests' },
    })
  })

  it('when given a config option, returns its path', () => {
    const argumentsList = ['--config=./crow-config.json']

    const result = parseArguments(argumentsList)

    expect(result.configPath()).toBe('./crow-config.json')
  })

  it('when given a bare option, does not consume the next word as a value', () => {
    const argumentsList = ['--verbose', 'git-commit']

    const result = parseArguments(argumentsList)

    expect<unknown>(result).toEqual({
      commands: ['git-commit'],
      options: { verbose: true },
    })
  })

  it('when given --no-color, returns a plain no-color option', () => {
    const argumentsList = ['--no-color']

    const result = parseArguments(argumentsList)

    expect<unknown>(result).toEqual({
      commands: [],
      options: { 'no-color': true },
    })
  })

  it('when given a double dash, returns the rest as unparsed commands', () => {
    const argumentsList = ['git-commit', '--', '--verbose', 'x']

    const result = parseArguments(argumentsList)

    expect<unknown>(result).toEqual({
      commands: ['git-commit', '--verbose', 'x'],
      options: {},
    })
  })

  it('when a bare option precedes a number, returns the number as a command', () => {
    const argumentsList = ['--verbose', '42']

    const result = parseArguments(argumentsList)

    expect<unknown>(result).toEqual({
      commands: ['42'],
      options: { verbose: true },
    })
  })

  it('when given numeric-looking values, keeps them as strings', () => {
    const argumentsList = ['--count=5', '007']

    const result = parseArguments(argumentsList)

    expect<unknown>(result).toEqual({
      commands: ['007'],
      options: { count: '5' },
    })
  })
})

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { parseArguments } from '../../src/cli/arguments.ts'

describe('parseArguments', () => {
  it('when given no arguments, returns empty commands and options', () => {
    const argumentsList: string[] = []

    const result = parseArguments(argumentsList)

    expect(result).toEqual({ commands: [], options: {} })
  })

  it('when given --help, returns a help option', () => {
    const argumentsList = ['--help']

    const result = parseArguments(argumentsList)

    expect(result).toEqual({ commands: [], options: { help: true } })
  })

  it('when given -h, returns an h option', () => {
    const argumentsList = ['-h']

    const result = parseArguments(argumentsList)

    expect(result).toEqual({ commands: [], options: { h: true } })
  })

  it('when given --key=value, returns the value as a string option', () => {
    const argumentsList = ['--goal=Refactor hallucinatory tests', 'git-commit']

    const result = parseArguments(argumentsList)

    expect(result).toEqual({
      commands: ['git-commit'],
      options: { goal: 'Refactor hallucinatory tests' },
    })
  })

  it('when given a bare option, does not consume the next word as a value', () => {
    const argumentsList = ['--verbose', 'git-commit']

    const result = parseArguments(argumentsList)

    expect(result).toEqual({
      commands: ['git-commit'],
      options: { verbose: true },
    })
  })
})

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { parseArguments } from '../../src/cli/arguments.ts'

describe('parseArguments', () => {
  it('when given a subcommand and goal words, returns the subcommand and joined goal', () => {
    const argumentsList = ['git-commit', 'ship', 'the', 'command']

    const result = parseArguments(argumentsList)

    expect(result.subcommand).toBe('git-commit')
    expect(result.goal).toBe('ship the command')
    expect(result.help).toBe(false)
    expect(result.version).toBe(false)
    expect(result.unsupported).toEqual([])
  })

  it('when given only a subcommand, returns an empty goal', () => {
    const argumentsList = ['find-models']

    const result = parseArguments(argumentsList)

    expect(result.subcommand).toBe('find-models')
    expect(result.goal).toBe('')
    expect(result.help).toBe(false)
    expect(result.version).toBe(false)
    expect(result.unsupported).toEqual([])
  })

  it('when given -h, returns help true', () => {
    const argumentsList = ['-h']

    const result = parseArguments(argumentsList)

    expect(result.help).toBe(true)
    expect(result.version).toBe(false)
    expect(result.unsupported).toEqual([])
  })

  it('when given --help, returns help true', () => {
    const argumentsList = ['--help']

    const result = parseArguments(argumentsList)

    expect(result.help).toBe(true)
    expect(result.version).toBe(false)
    expect(result.unsupported).toEqual([])
  })

  it('when given -V, returns version true', () => {
    const argumentsList = ['-V']

    const result = parseArguments(argumentsList)

    expect(result.help).toBe(false)
    expect(result.version).toBe(true)
    expect(result.unsupported).toEqual([])
  })

  it('when given --version, returns version true', () => {
    const argumentsList = ['--version']

    const result = parseArguments(argumentsList)

    expect(result.help).toBe(false)
    expect(result.version).toBe(true)
    expect(result.unsupported).toEqual([])
  })

  it('when given an unsupported option, returns it in unsupported', () => {
    const argumentsList = ['--unknown']

    const result = parseArguments(argumentsList)

    expect(result.help).toBe(false)
    expect(result.version).toBe(false)
    expect(result.unsupported).toEqual(['--unknown'])
  })

  it('when given values after --, treats them as positionals', () => {
    const argumentsList = ['git-commit', '--', '-h']

    const result = parseArguments(argumentsList)

    expect(result.subcommand).toBe('git-commit')
    expect(result.goal).toBe('-h')
    expect(result.help).toBe(false)
    expect(result.version).toBe(false)
    expect(result.unsupported).toEqual([])
  })

  it('when given positionals before and after --, joins them as positionals', () => {
    const argumentsList = ['find-models', '--', 'extra']

    const result = parseArguments(argumentsList)

    expect(result.subcommand).toBe('find-models')
    expect(result.goal).toBe('extra')
    expect(result.help).toBe(false)
    expect(result.version).toBe(false)
    expect(result.unsupported).toEqual([])
  })
})

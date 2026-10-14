import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { DenoRuntime } from '../../src/application-data/deno-runtime.ts'
import { ParsedArguments } from '../../src/application-data/arguments.ts'
import {
  Environment,
  loadEnvironmentalVariables,
} from '../../src/application-data/env-vars.ts'

describe('DenoRuntime', () => {
  it('returns the runtime arguments', () => {
    const runtime = new DenoRuntime(Deno)

    const args = runtime.args()

    expect(args).toBe(Deno.args)
  })

  it('returns the Deno command constructor', () => {
    const runtime = new DenoRuntime(Deno)

    const denoCommand = runtime.denoCommand()

    expect(denoCommand).toBe(Deno.Command)
  })

  it('returns the real path function', () => {
    const runtime = new DenoRuntime(Deno)

    const getRealPath = runtime.getRealPath()

    expect(getRealPath).toBe(Deno.realPath)
  })

  it('parses the runtime arguments once', () => {
    const deno = { ...Deno, args: ['commit', '--help'] }
    const runtime = new DenoRuntime(deno)

    const parsed = runtime.parsedArguments()

    expect(parsed).toBeInstanceOf(ParsedArguments)
    expect(parsed.commands).toEqual(['commit'])
    expect(runtime.parsedArguments()).toBe(parsed)
  })

  it('loads the environmental variables once', () => {
    const runtime = new DenoRuntime(Deno)

    const environment = runtime.envars()

    expect(environment).toBeInstanceOf(Environment)
    expect(environment.value('PATH')).toBe(Deno.env.get('PATH'))
    expect(runtime.envars()).toBe(environment)
  })

  it('when an environment is given, returns it', async () => {
    const loaded = await loadEnvironmentalVariables(
      'tests/support/fixtures/builder-values.env',
    )
    const runtime = new DenoRuntime(Deno, loaded)

    const environment = runtime.envars()

    expect(environment).toBe(loaded)
    expect(environment.value('BUILDER_ONLY_KEY')).toBe('builder-value')
  })
})

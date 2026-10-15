import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { defaultRuntime, Runtime } from '../../src/application-data/runtime.ts'
import { ParsedArguments } from '../../src/application-data/arguments.ts'
import {
  Environment,
  loadEnvironmentalVariables,
} from '../../src/application-data/env-vars.ts'
import { clearDirectory, fixturesDirectory } from '../support/fixtures.ts'

describe('runtime', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/runtime`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/runtime`))

  it('returns the runtime arguments', () => {
    const runtime = new Runtime(Deno)

    const args = runtime.args()

    expect(args).toBe(Deno.args)
  })

  it('returns the Deno command constructor', () => {
    const runtime = new Runtime(Deno)

    const denoCommand = runtime.denoCommand()

    expect(denoCommand).toBe(Deno.Command)
  })

  it('parses the runtime arguments once', () => {
    const deno = { ...Deno, args: ['commit', '--help'] }
    const runtime = new Runtime(deno)

    const parsed = runtime.parsedArguments()

    expect(parsed).toBeInstanceOf(ParsedArguments)
    expect(parsed.commands).toEqual(['commit'])
    expect(runtime.parsedArguments()).toBe(parsed)
  })

  it('loads the environmental variables once', () => {
    const runtime = new Runtime(Deno)

    const environment = runtime.envars()

    expect(environment).toBeInstanceOf(Environment)
    expect(environment.value('PATH')).toBe(Deno.env.get('PATH'))
    expect(runtime.envars()).toBe(environment)
  })

  it('when an environment is given, returns it', async () => {
    const loaded = await loadEnvironmentalVariables(
      'tests/support/fixtures/builder-values.env',
    )
    const runtime = new Runtime(Deno, loaded)

    const environment = runtime.envars()

    expect(environment).toBe(loaded)
    expect(environment.value('BUILDER_ONLY_KEY')).toBe('builder-value')
  })

  it('when no working directory is given, returns the process working directory', () => {
    const runtime = new Runtime(Deno)

    const cwd = runtime.cwd()

    expect(cwd).toBe(Deno.cwd())
  })

  it('when an environment file is loaded, keeps the working directory', async () => {
    const runtime = new Runtime(Deno, new Environment(Deno), '/somewhere')

    const loaded = await runtime.withEnvironmentFile(
      'tests/support/fixtures/builder-values.env',
    )

    expect(loaded.cwd()).toBe('/somewhere')
    expect(loaded.envars().value('BUILDER_ONLY_KEY')).toBe('builder-value')
  })

  it('reads a text file', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/runtime`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/runtime/alpha.txt`, 'one\n')
    const runtime = new Runtime(Deno)

    const text = await runtime.readTextFile(
      `${fixturesDirectory}/runtime/alpha.txt`,
    )

    expect(text).toBe('one\n')
  })

  it('writes a text file', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/runtime`, { recursive: true })
    const runtime = new Runtime(Deno)

    await runtime.writeTextFile(`${fixturesDirectory}/runtime/alpha.txt`, 'two')

    expect(
      Deno.readTextFileSync(`${fixturesDirectory}/runtime/alpha.txt`),
    ).toBe('two')
  })

  it('makes a directory with its missing parents', async () => {
    const runtime = new Runtime(Deno)

    await runtime.mkdir(`${fixturesDirectory}/runtime/one/two`)

    expect(
      Deno.statSync(`${fixturesDirectory}/runtime/one/two`).isDirectory,
    ).toBe(true)
  })

  it('renames a file', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/runtime`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/runtime/alpha.txt`, 'one\n')
    const runtime = new Runtime(Deno)

    await runtime.rename(
      `${fixturesDirectory}/runtime/alpha.txt`,
      `${fixturesDirectory}/runtime/beta.txt`,
    )

    expect(
      Deno.readTextFileSync(`${fixturesDirectory}/runtime/beta.txt`),
    ).toBe('one\n')
    expect(() => Deno.statSync(`${fixturesDirectory}/runtime/alpha.txt`))
      .toThrow()
  })

  it('removes a file', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/runtime`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/runtime/alpha.txt`, 'one\n')
    const runtime = new Runtime(Deno)

    await runtime.remove(`${fixturesDirectory}/runtime/alpha.txt`)

    expect(() => Deno.statSync(`${fixturesDirectory}/runtime/alpha.txt`))
      .toThrow()
  })

  it('when the path exists, lstat resolves', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/runtime`, { recursive: true })
    const runtime = new Runtime(Deno)

    const lstat = runtime.lstat(`${fixturesDirectory}/runtime`)

    await expect(lstat).resolves.toBeUndefined()
  })

  it('when the path is missing, lstat rejects', async () => {
    const runtime = new Runtime(Deno)

    const lstat = runtime.lstat(`${fixturesDirectory}/runtime/missing`)

    await expect(lstat).rejects.toThrow()
  })

  it('resolves the real path', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/runtime/one`, { recursive: true })
    const runtime = new Runtime(Deno)

    const realPath = await runtime.realPath(
      `${fixturesDirectory}/runtime/one/..`,
    )

    expect(realPath).toBe(Deno.realPathSync(`${fixturesDirectory}/runtime`))
  })

  it('when the error is a missing file, isNotFound is true', () => {
    const runtime = new Runtime(Deno)

    const notFound = runtime.isNotFound(new Deno.errors.NotFound('missing'))

    expect(notFound).toBe(true)
  })

  it('when the error is not a missing file, isNotFound is false', () => {
    const runtime = new Runtime(Deno)

    const notFound = runtime.isNotFound(new SyntaxError('bad json'))

    expect(notFound).toBe(false)
  })

  it('when built by default, uses the Deno global', () => {
    const runtime = defaultRuntime()

    const args = runtime.args()

    expect(args).toBe(Deno.args)
  })
})

import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import {
  Environment,
  loadEnvironmentalVariables,
} from '../../src/application-data/env-vars.ts'
import { clearDirectory, fixturesDirectory } from '../support/fixtures.ts'
import { denoWithEnv, mockEnvironment } from '../support/mock-environment.ts'

describe('env-vars', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'env-vars')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'env-vars')))

  it('when a value exists, returns it', () => {
    const environment = mockEnvironment({ API_KEY: 'secret' })

    const value = environment.value('API_KEY')

    expect(value).toBe('secret')
    expect(environment.hasValue('API_KEY')).toBe(true)
  })

  it('when a value is missing, returns an empty value', () => {
    const environment = mockEnvironment({})

    const value = environment.value('API_KEY')

    expect(value).toBe('')
    expect(environment.hasValue('API_KEY')).toBe(false)
  })

  it('when no deno is given, reads the process environment', () => {
    const environment = new Environment()

    const value = environment.value('PATH')

    expect(value).toBe(Deno.env.get('PATH'))
  })

  it('when an environment file exists, loads its values', async () => {
    const directory = join(fixturesDirectory, 'env-vars', 'present')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'values.env')
    Deno.writeTextFileSync(path, 'FILE_ONLY_KEY=file-value\n')
    const environment = new Environment(denoWithEnv(), path)

    await environment.run()

    expect(environment.value('FILE_ONLY_KEY')).toBe('file-value')
  })

  it('when the environment path starts with ~, reads the file under HOME', async () => {
    const home = join(fixturesDirectory, 'env-vars', 'home')
    Deno.mkdirSync(home, { recursive: true })
    Deno.writeTextFileSync(join(home, 'values.env'), 'HOME_KEY=home-value\n')
    const environment = new Environment(
      denoWithEnv({ HOME: home }),
      '~/values.env',
    )

    await environment.run()

    expect(environment.value('HOME_KEY')).toBe('home-value')
  })

  it('when an environment file is missing, keeps the process values', async () => {
    const path = join(fixturesDirectory, 'env-vars', 'missing', 'missing.env')
    const environment = new Environment(
      denoWithEnv({ API_KEY: 'secret' }),
      path,
    )

    await environment.run()

    expect(environment.value('API_KEY')).toBe('secret')
  })

  it('when the environment path is empty, keeps the process values', async () => {
    const environment = new Environment(denoWithEnv({ API_KEY: 'secret' }), '')

    await environment.run()

    expect(environment.value('API_KEY')).toBe('secret')
  })

  it('when a process value and a file value share a name, the process value wins', async () => {
    const directory = join(fixturesDirectory, 'env-vars', 'shared')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'values.env')
    Deno.writeTextFileSync(path, 'API_KEY=from-file\n')
    const environment = new Environment(
      denoWithEnv({ API_KEY: 'from-process' }),
      path,
    )

    await environment.run()

    expect(environment.value('API_KEY')).toBe('from-process')
  })

  it('when loaded, combines the process values with the environment file', async () => {
    const directory = join(fixturesDirectory, 'env-vars', 'loaded')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'values.env')
    Deno.writeTextFileSync(path, 'FILE_ONLY_KEY=file-value\n')
    const deno = denoWithEnv({ API_KEY: 'secret' })

    const environment = await loadEnvironmentalVariables(path, deno)

    expect(environment.value('API_KEY')).toBe('secret')
    expect(environment.value('FILE_ONLY_KEY')).toBe('file-value')
  })
})

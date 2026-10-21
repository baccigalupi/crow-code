import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  Environment,
  loadEnvironmentalVariables,
} from '../../src/application-data/env-vars.ts'
import { defaultFilesystem } from '../../src/application-data/filesystem.ts'
import { clearDirectory, fixturesDirectory } from '../support/fixtures.ts'

describe('env-vars', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'env-vars')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'env-vars')))

  it('when a value exists, returns it', () => {
    const environment = new Environment({
      runtimeEnvironment: { API_KEY: 'secret' },
      filesystem: defaultFilesystem(),
    })

    const value = environment.value('API_KEY')

    expect(value).toBe('secret')
    expect(environment.hasValue('API_KEY')).toBe(true)
  })

  it('when a value is missing, returns an empty value', () => {
    const environment = new Environment({
      runtimeEnvironment: {},
      filesystem: defaultFilesystem(),
    })

    const value = environment.value('API_KEY')

    expect(value).toBe('')
    expect(environment.hasValue('API_KEY')).toBe(false)
  })

  it('when an environment file exists, loads its values', async () => {
    const directory = join(fixturesDirectory, 'env-vars', 'present')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'values.env')
    writeFileSync(path, 'FILE_ONLY_KEY=file-value\n')
    const environment = new Environment({
      runtimeEnvironment: {},
      filesystem: defaultFilesystem(),
      path,
    })

    await environment.run()

    expect(environment.value('FILE_ONLY_KEY')).toBe('file-value')
  })

  it('when the environment path starts with ~, reads the file under HOME', async () => {
    const home = join(fixturesDirectory, 'env-vars', 'home')
    mkdirSync(home, { recursive: true })
    writeFileSync(join(home, 'values.env'), 'HOME_KEY=home-value\n')
    const environment = new Environment({
      runtimeEnvironment: { HOME: home },
      filesystem: defaultFilesystem(),
      path: '~/values.env',
    })

    await environment.run()

    expect(environment.value('HOME_KEY')).toBe('home-value')
  })

  it('when an environment file is missing, keeps the runtime environment', async () => {
    const path = join(fixturesDirectory, 'env-vars', 'missing', 'missing.env')
    const environment = new Environment({
      runtimeEnvironment: { API_KEY: 'secret' },
      filesystem: defaultFilesystem(),
      path,
    })

    await environment.run()

    expect(environment.value('API_KEY')).toBe('secret')
  })

  it('when the environment path is empty, keeps the runtime environment', async () => {
    const environment = new Environment({
      runtimeEnvironment: { API_KEY: 'secret' },
      filesystem: defaultFilesystem(),
      path: '',
    })

    await environment.run()

    expect(environment.value('API_KEY')).toBe('secret')
  })

  it('when no path is given, keeps the runtime environment', async () => {
    const environment = new Environment({
      runtimeEnvironment: { API_KEY: 'secret' },
      filesystem: defaultFilesystem(),
    })

    await environment.run()

    expect(environment.value('API_KEY')).toBe('secret')
  })

  it('when a runtime environment value and a file value share a name, the runtime environment value wins', async () => {
    const directory = join(fixturesDirectory, 'env-vars', 'shared')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'values.env')
    writeFileSync(path, 'API_KEY=from-file\n')
    const environment = new Environment({
      runtimeEnvironment: { API_KEY: 'from-runtime-environment' },
      filesystem: defaultFilesystem(),
      path,
    })

    await environment.run()

    expect(environment.value('API_KEY')).toBe('from-runtime-environment')
  })

  it('when an environment file uses export, comments and quotes, parses them', async () => {
    const directory = join(fixturesDirectory, 'env-vars', 'quoted')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'values.env')
    writeFileSync(
      path,
      'export A=1\n# c\nB="x\\ny" # t\nC=\'z\'\n',
    )
    const environment = new Environment({
      runtimeEnvironment: {},
      filesystem: defaultFilesystem(),
      path,
    })

    await environment.run()

    expect(environment.value('A')).toBe('1')
    expect(environment.value('B')).toBe('x\ny')
    expect(environment.value('C')).toBe('z')
  })

  it('when loaded, combines the runtime environment with the environment file', async () => {
    const directory = join(fixturesDirectory, 'env-vars', 'loaded')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'values.env')
    writeFileSync(path, 'FILE_ONLY_KEY=file-value\n')

    const environment = await loadEnvironmentalVariables({
      runtimeEnvironment: { API_KEY: 'secret' },
      filesystem: defaultFilesystem(),
      path,
    })

    expect(environment.value('API_KEY')).toBe('secret')
    expect(environment.value('FILE_ONLY_KEY')).toBe('file-value')
  })
})

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { loadConfig } from '../../src/application-data/load-config.ts'
import { defaultRuntime } from '../../src/application-data/runtime.ts'
import { fixturesDirectory } from '../support/fixtures.ts'

describe('loadConfig', () => {
  it('returns a config loader with the default config path', () => {
    const path = undefined

    const config = loadConfig({ path, runtime: defaultRuntime() })

    expect(config.configPath).toBe('.crow/config.json')
    expect(config.crowRepoDirectory).toBe('.crow')
  })

  it('returns a config loader with the provided config path', () => {
    const path = './custom-crow-repo/config.json'

    const config = loadConfig({ path, runtime: defaultRuntime() })

    expect(config.configPath).toBe('./custom-crow-repo/config.json')
    expect(config.crowRepoDirectory).toBe('./custom-crow-repo')
  })

  it('loads the config at the provided path', async () => {
    const operation = loadConfig({
      path: join(fixturesDirectory, 'config.json'),
      runtime: defaultRuntime(),
    })

    await operation.run()
    const config = operation.result()

    expect(config.crowGlobalDirectory).toBe('tests/support/fixtures/.crow')
    expect(config.ignoredDirectories).toEqual(['vendor'])
    expect(config.readableDirectories).toEqual(['/readable'])
    expect(config.writableDirectories).toEqual(['/writable'])
  })

  it('when the config sets envFile, exposes it', async () => {
    const operation = loadConfig({
      path: join(fixturesDirectory, 'env-file-config.json'),
      runtime: defaultRuntime(),
    })

    await operation.run()
    const config = operation.result()

    expect(operation.success()).toBe(true)
    expect(config.envFile).toBe('/secrets/crow.env')
  })

  it('when using the default config, envFile is .env in ~/.crow', () => {
    const operation = loadConfig({
      path: join(fixturesDirectory, 'missing-config.json'),
      runtime: defaultRuntime(),
    })

    const config = operation.result()

    expect(config.envFile).toBe('~/.crow/.env')
  })

  it('returns the default config when the path is not found', async () => {
    const operation = loadConfig({
      path: join(fixturesDirectory, 'missing-config.json'),
      runtime: defaultRuntime(),
    })

    await operation.run()
    const config = operation.result()

    expect(operation.success()).toBe(false)
    expect(operation.reason).toBe('')
    expect(config.crowGlobalDirectory).toBe('~/.crow')
    expect(config.ignoredDirectories).toEqual([])
    expect(config.readableDirectories).toEqual([])
    expect(config.writableDirectories).toEqual([])
  })

  it('fails when the config contains malformed JSON', async () => {
    const operation = loadConfig({
      path: join(fixturesDirectory, 'malformed-config.txt'),
      runtime: defaultRuntime(),
    })

    await operation.run()
    const config = operation.result()

    expect(operation.success()).toBe(false)
    expect(config.crowGlobalDirectory).toBe('~/.crow')
    expect(config.ignoredDirectories).toEqual([])
    expect(config.readableDirectories).toEqual([])
    expect(config.writableDirectories).toEqual([])
  })

  it('fails with the error message when the path cannot be read', async () => {
    const operation = loadConfig({
      path: fixturesDirectory,
      runtime: defaultRuntime(),
    })

    await operation.run()
    const config = operation.result()

    expect(operation.success()).toBe(false)
    expect(operation.reason.length).toBeGreaterThan(0)
    expect(config.crowGlobalDirectory).toBe('~/.crow')
  })

  it('fails when the config does not match the schema', async () => {
    const operation = loadConfig({
      path: join(fixturesDirectory, 'incomplete-config.json'),
      runtime: defaultRuntime(),
    })

    await operation.run()
    const config = operation.result()

    expect(operation.success()).toBe(false)
    expect(config.crowGlobalDirectory).toBe('~/.crow')
    expect(config.ignoredDirectories).toEqual([])
    expect(config.readableDirectories).toEqual([])
    expect(config.writableDirectories).toEqual([])
  })
})

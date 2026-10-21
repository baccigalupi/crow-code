import { describe, expect, it, mock } from 'bun:test'
import { join } from 'node:path'
import { pino } from 'pino'
import type { Logger } from '../../src/types.ts'
import { loadConfig } from '../../src/application-data/load-config.ts'
import { parseArguments } from '../../src/application-data/arguments.ts'
import { defaultFilesystem } from '../../src/application-data/filesystem.ts'
import { fixturesDirectory } from '../support/fixtures.ts'

describe('loadConfig', () => {
  it('returns a config loader with the default config path', () => {
    const path = undefined

    const config = loadConfig({ path, filesystem: defaultFilesystem() })

    expect(config.configPath).toBe('.crow/config.json')
    expect(config.crowRepoDirectory).toBe('.crow')
  })

  it('returns a config loader with the provided config path', () => {
    const path = './custom-crow-repo/config.json'

    const config = loadConfig({ path, filesystem: defaultFilesystem() })

    expect(config.configPath).toBe('./custom-crow-repo/config.json')
    expect(config.crowRepoDirectory).toBe('./custom-crow-repo')
  })

  it('when no path is provided, uses the command-line config path', () => {
    const parsedArguments = parseArguments(['--config=./cli/config.json'])

    const config = loadConfig({
      parsedArguments,
      filesystem: defaultFilesystem(),
    })

    expect(config.configPath).toBe('./cli/config.json')
  })

  it('when a path is provided, prefers it over the command-line config path', () => {
    const parsedArguments = parseArguments(['--config=./cli/config.json'])

    const config = loadConfig({
      path: './custom-crow-repo/config.json',
      parsedArguments,
      filesystem: defaultFilesystem(),
    })

    expect(config.configPath).toBe('./custom-crow-repo/config.json')
  })

  it('when the config is malformed, logs the failure naming the path', async () => {
    const errorSpy = mock()
    const path = join(fixturesDirectory, 'malformed-config.txt')
    const operation = loadConfig({
      path,
      filesystem: defaultFilesystem(),
      logger: { error: errorSpy } as unknown as Logger,
    })

    await operation.run()
    const config = operation.result()

    expect(errorSpy.mock.calls).toHaveLength(1)
    expect(errorSpy.mock.calls[0][0]).toBe(
      `Load config: '${path}': the file is not valid JSON`,
    )
    expect(config.crowGlobalDirectory).toBe('~/.crow')
    expect(config.envFile).toBe('~/.crow/.env')
    expect(config.ignoredDirectories).toEqual([])
  })

  it('loads the config at the provided path', async () => {
    const operation = loadConfig({
      path: join(fixturesDirectory, 'config.json'),
      filesystem: defaultFilesystem(),
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
      filesystem: defaultFilesystem(),
    })

    await operation.run()
    const config = operation.result()

    expect(operation.success()).toBe(true)
    expect(config.envFile).toBe('/secrets/crow.env')
  })

  it('when using the default config, envFile is .env in ~/.crow', () => {
    const operation = loadConfig({
      path: join(fixturesDirectory, 'missing-config.json'),
      filesystem: defaultFilesystem(),
    })

    const config = operation.result()

    expect(config.envFile).toBe('~/.crow/.env')
  })

  it('returns the default config when the path is not found', async () => {
    const operation = loadConfig({
      path: join(fixturesDirectory, 'missing-config.json'),
      filesystem: defaultFilesystem(),
      logger: pino({ enabled: false }),
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
      filesystem: defaultFilesystem(),
      logger: pino({ enabled: false }),
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
      filesystem: defaultFilesystem(),
      logger: pino({ enabled: false }),
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
      filesystem: defaultFilesystem(),
      logger: pino({ enabled: false }),
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

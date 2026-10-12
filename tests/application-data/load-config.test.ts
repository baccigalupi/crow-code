import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { loadConfig } from '../../src/application-data/load-config.ts'
import { fixturesDirectory } from '../support/fixtures.ts'

describe('loadConfig', () => {
  it('returns a config with the default repo path', () => {
    const path = undefined

    const config = loadConfig(path)

    expect(config.crowRepoPath).toBe('.crow')
  })

  it('returns a config with the provided repo path', () => {
    const path = './custom-crow-repo'

    const config = loadConfig(path)

    expect(config.crowRepoPath).toBe('./custom-crow-repo')
  })

  it('loads the config at the provided path', async () => {
    const operation = loadConfig(join(fixturesDirectory, 'config.json'))

    await operation.run()
    const config = operation.result()

    expect(config.userDirectory).toBe('/custom/crow')
    expect(config.ignoredDirectories).toEqual(['vendor'])
    expect(config.readableDirectories).toEqual(['/readable'])
    expect(config.writableDirectories).toEqual(['/writable'])
  })

  it('returns the default config when the path is not found', async () => {
    const operation = loadConfig(join(fixturesDirectory, 'missing-config.json'))

    await operation.run()
    const config = operation.result()

    expect(operation.success()).toBe(false)
    expect(config.userDirectory).toBe('~/.crow')
    expect(config.ignoredDirectories).toEqual(['node_modules', '.git'])
    expect(config.readableDirectories).toEqual([])
    expect(config.writableDirectories).toEqual([])
  })

  it('fails when the config contains malformed JSON', async () => {
    const operation = loadConfig(
      join(fixturesDirectory, 'malformed-config.txt'),
    )

    await operation.run()
    const config = operation.result()

    expect(operation.success()).toBe(false)
    expect(config.userDirectory).toBe('~/.crow')
    expect(config.ignoredDirectories).toEqual(['node_modules', '.git'])
    expect(config.readableDirectories).toEqual([])
    expect(config.writableDirectories).toEqual([])
  })

  it('fails when the config does not match the schema', async () => {
    const operation = loadConfig(
      join(fixturesDirectory, 'incomplete-config.json'),
    )

    await operation.run()
    const config = operation.result()

    expect(operation.success()).toBe(false)
    expect(config.userDirectory).toBe('~/.crow')
    expect(config.ignoredDirectories).toEqual(['node_modules', '.git'])
    expect(config.readableDirectories).toEqual([])
    expect(config.writableDirectories).toEqual([])
  })
})

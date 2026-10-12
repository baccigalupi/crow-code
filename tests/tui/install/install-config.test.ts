import { describe, it } from 'node:test'
import { join } from '@std/path'
import { expect } from '@std/expect'
import {
  installConfig,
  writeInstallConfig,
} from '../../../src/tui/install/install-config.ts'
import { emptyBuffer, insertText } from '../../../src/tui/input-buffer.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'

describe('install-config', () => {
  it('when no directories are given, resolves the defaults', () => {
    const crowRepoDirectory = emptyBuffer()
    const crowGlobalDirectory = emptyBuffer()

    const config = installConfig({
      repo: crowRepoDirectory,
      user: crowGlobalDirectory,
    })
      .all()

    expect(config.crowRepoDirectory).toBe('.crow')
    expect(config.crowGlobalDirectory).toBe('~/.crow')
    expect(config.filePath).toBe('.crow/config.json')
  })

  it('when directories are given, resolves the given directories', () => {
    const crowRepoDirectory = insertText(emptyBuffer(), './lib')
    const crowGlobalDirectory = insertText(emptyBuffer(), '/opt/crow')

    const config = installConfig({
      repo: crowRepoDirectory,
      user: crowGlobalDirectory,
    })
      .all()

    expect(config.crowRepoDirectory).toBe('./lib')
    expect(config.crowGlobalDirectory).toBe('/opt/crow')
    expect(config.filePath).toBe('./lib/config.json')
  })

  it('includes the default permissions block', () => {
    const crowRepoDirectory = emptyBuffer()
    const crowGlobalDirectory = emptyBuffer()

    const { config } = installConfig({
      repo: crowRepoDirectory,
      user: crowGlobalDirectory,
    }).all()

    expect(config.permissions.ignore).toEqual(['node_modules', '.git'])
    expect(config.permissions.additionalRead).toEqual([])
    expect(config.permissions.additionalWrite).toEqual([])
  })

  it('serializes the config to pretty json', () => {
    const crowRepoDirectory = emptyBuffer()
    const crowGlobalDirectory = emptyBuffer()

    const { json, config } = installConfig({
      repo: crowRepoDirectory,
      user: crowGlobalDirectory,
    }).all()

    expect(JSON.parse(json)).toEqual(config)
    expect(json).toContain('\n')
  })

  it('when saved, writes the json to the repo config path', async () => {
    const directory = join(fixturesDirectory, 'install-config', 'crow')
    await clearDirectory(directory)

    writeInstallConfig(
      installConfig({
        repo: insertText(emptyBuffer(), directory),
        user: emptyBuffer(),
      }).all(),
    )

    const written = Deno.readTextFileSync(join(directory, 'config.json'))
    expect(JSON.parse(written).crowGlobalDirectory).toBe('~/.crow')
    await clearDirectory(directory)
  })
})

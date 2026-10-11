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
    const repoDirectory = emptyBuffer()
    const userDirectory = emptyBuffer()

    const config = installConfig({ repo: repoDirectory, user: userDirectory })
      .all()

    expect(config.repoDirectory).toBe('.crow')
    expect(config.userDirectory).toBe('~/.crow')
    expect(config.filePath).toBe('.crow/config.json')
  })

  it('when directories are given, resolves the given directories', () => {
    const repoDirectory = insertText(emptyBuffer(), './lib')
    const userDirectory = insertText(emptyBuffer(), '/opt/crow')

    const config = installConfig({ repo: repoDirectory, user: userDirectory })
      .all()

    expect(config.repoDirectory).toBe('./lib')
    expect(config.userDirectory).toBe('/opt/crow')
    expect(config.filePath).toBe('./lib/config.json')
  })

  it('includes the default permissions block', () => {
    const repoDirectory = emptyBuffer()
    const userDirectory = emptyBuffer()

    const { config } = installConfig({
      repo: repoDirectory,
      user: userDirectory,
    }).all()

    expect(config.permissions.ignore).toEqual(['node_modules', '.git'])
    expect(config.permissions.additionalRead).toEqual([])
    expect(config.permissions.additionalWrite).toEqual([])
  })

  it('serializes the config to pretty json', () => {
    const repoDirectory = emptyBuffer()
    const userDirectory = emptyBuffer()

    const { json, config } = installConfig({
      repo: repoDirectory,
      user: userDirectory,
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
    expect(JSON.parse(written).userDirectory).toBe('~/.crow')
    await clearDirectory(directory)
  })
})

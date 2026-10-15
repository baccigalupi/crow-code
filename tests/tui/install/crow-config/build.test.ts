import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { buildCrowConfig } from '../../../../src/tui/install/crow-config/build.ts'
import { emptyBuffer, insertText } from '../../../../src/tui/input-buffer.ts'

describe('build', () => {
  it('when no directories are given, resolves the defaults', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()

    const config = buildCrowConfig({
      repoDirectory,
      globalDirectory,
      envFile: emptyBuffer(),
    })
      .all()

    expect(config.crowRepoDirectory).toBe('.crow')
    expect(config.crowGlobalDirectory).toBe('~/.crow')
    expect(config.crowConfigPath).toBe('.crow/config.json')
  })

  it('when directories are given, resolves the given directories', () => {
    const repoDirectory = insertText(emptyBuffer(), './lib')
    const globalDirectory = insertText(emptyBuffer(), '/opt/crow')

    const config = buildCrowConfig({
      repoDirectory,
      globalDirectory,
      envFile: emptyBuffer(),
    })
      .all()

    expect(config.crowRepoDirectory).toBe('./lib')
    expect(config.crowGlobalDirectory).toBe('/opt/crow')
    expect(config.crowConfigPath).toBe('./lib/config.json')
  })

  it('when no env file is given and the global directory is the default, resolves ~/.crow/.env', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()
    const envFile = emptyBuffer()

    const { config } = buildCrowConfig({
      repoDirectory,
      globalDirectory,
      envFile,
    }).all()

    expect(config.envFile).toBe('~/.crow/.env')
  })

  it('when no env file is given and the global directory is custom, resolves .env inside it', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = insertText(emptyBuffer(), '/opt/crow')
    const envFile = emptyBuffer()

    const { config } = buildCrowConfig({
      repoDirectory,
      globalDirectory,
      envFile,
    }).all()

    expect(config.envFile).toBe('/opt/crow/.env')
  })

  it('when an env file is given, it wins over the derived default', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = insertText(emptyBuffer(), '/opt/crow')
    const envFile = insertText(emptyBuffer(), '/secrets/crow.env')

    const { config } = buildCrowConfig({
      repoDirectory,
      globalDirectory,
      envFile,
    }).all()

    expect(config.envFile).toBe('/secrets/crow.env')
  })

  it('includes the default permissions block', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()

    const { config } = buildCrowConfig({
      repoDirectory,
      globalDirectory,
      envFile: emptyBuffer(),
    }).all()

    expect(config.permissions.ignore).toEqual([])
    expect(config.permissions.additionalRead).toEqual([])
    expect(config.permissions.additionalWrite).toEqual([])
  })

  it('serializes the config to pretty json', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()

    const { crowConfigJson, config } = buildCrowConfig({
      repoDirectory,
      globalDirectory,
      envFile: emptyBuffer(),
    }).all()

    expect(JSON.parse(crowConfigJson)).toEqual(config)
    expect(crowConfigJson).toContain('\n')
    expect(crowConfigJson).toContain('"envFile": "~/.crow/.env"')
  })
})

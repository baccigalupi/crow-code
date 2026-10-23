import { describe, expect, it } from 'bun:test'
import { buildCrowConfig } from '../../../../src/opentui/install/crow-config/build.ts'
import { emptyText, insertText } from '../../../../src/opentui/input-text.ts'

describe('build', () => {
  it('when no directories are given, resolves the defaults', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()

    const config = buildCrowConfig({
      repoDirectory,
      globalDirectory,
      envFile: emptyText(),
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    }).all()

    expect(config.crowRepoDirectory).toBe('.crow')
    expect(config.crowGlobalDirectory).toBe('~/.crow')
    expect(config.crowConfigPath).toBe('.crow/config.json')
  })

  it('when directories are given, resolves the given directories', () => {
    const repoDirectory = insertText(emptyText(), './lib')
    const globalDirectory = insertText(emptyText(), '/opt/crow')

    const config = buildCrowConfig({
      repoDirectory,
      globalDirectory,
      envFile: emptyText(),
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    }).all()

    expect(config.crowRepoDirectory).toBe('./lib')
    expect(config.crowGlobalDirectory).toBe('/opt/crow')
    expect(config.crowConfigPath).toBe('./lib/config.json')
  })

  it('when no env file is given and the global directory is the default, resolves ~/.crow/.env', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()
    const envFile = emptyText()

    const { config } = buildCrowConfig({
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    }).all()

    expect(config.envFile).toBe('~/.crow/.env')
  })

  it('when no env file is given and the global directory is custom, resolves .env inside it', () => {
    const repoDirectory = emptyText()
    const globalDirectory = insertText(emptyText(), '/opt/crow')
    const envFile = emptyText()

    const { config } = buildCrowConfig({
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    }).all()

    expect(config.envFile).toBe('/opt/crow/.env')
  })

  it('when an env file is given, it wins over the derived default', () => {
    const repoDirectory = emptyText()
    const globalDirectory = insertText(emptyText(), '/opt/crow')
    const envFile = insertText(emptyText(), '/secrets/crow.env')

    const { config } = buildCrowConfig({
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    }).all()

    expect(config.envFile).toBe('/secrets/crow.env')
  })

  it('includes the default permissions block', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()

    const { config } = buildCrowConfig({
      repoDirectory,
      globalDirectory,
      envFile: emptyText(),
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    }).all()

    expect(config.permissions.ignore).toEqual([])
    expect(config.permissions.additionalRead).toEqual([])
    expect(config.permissions.additionalWrite).toEqual([])
  })

  it('when additional read directories are given, splits them on commas', () => {
    const additionalRead = insertText(emptyText(), '/docs, ~/notes')

    const { config } = buildCrowConfig({
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      additionalRead,
      escalateRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    }).all()

    expect(config.permissions.additionalRead).toEqual(['/docs', '~/notes'])
  })

  it('when no escalate directories are given, resolves the defaults', () => {
    const escalateRead = emptyText()
    const escalateWrite = emptyText()

    const { config } = buildCrowConfig({
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      additionalRead: emptyText(),
      escalateRead,
      escalateWrite,
      allowedLocalScripts: emptyText(),
    }).all()

    expect(config.permissions.escalateRead).toEqual([])
    expect(config.permissions.escalateWrite).toEqual(['./dev', './agent'])
  })

  it('when escalate directories are given, splits them on commas', () => {
    const escalateRead = insertText(emptyText(), '/docs, ~/notes')
    const escalateWrite = insertText(emptyText(), './scripts')

    const { config } = buildCrowConfig({
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      additionalRead: emptyText(),
      escalateRead,
      escalateWrite,
      allowedLocalScripts: emptyText(),
    }).all()

    expect(config.permissions.escalateRead).toEqual(['/docs', '~/notes'])
    expect(config.permissions.escalateWrite).toEqual(['./scripts'])
  })

  it('when escalate input has only separators, resolves the defaults', () => {
    const escalateWrite = insertText(emptyText(), ' , ,')

    const { config } = buildCrowConfig({
      repoDirectory: emptyText(),
      globalDirectory: emptyText(),
      envFile: emptyText(),
      additionalRead: emptyText(),
      escalateRead: emptyText(),
      escalateWrite,
      allowedLocalScripts: emptyText(),
    }).all()

    expect(config.permissions.escalateWrite).toEqual(['./dev', './agent'])
  })

  it('serializes the config to pretty json', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()

    const { crowConfigJson, config } = buildCrowConfig({
      repoDirectory,
      globalDirectory,
      envFile: emptyText(),
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    }).all()

    expect(JSON.parse(crowConfigJson)).toEqual(config)
    expect(crowConfigJson).toContain('\n')
    expect(crowConfigJson).toContain('"envFile": "~/.crow/.env"')
  })
})

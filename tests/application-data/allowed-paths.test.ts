import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path/join'
import { resolve } from '@std/path/resolve'
import { AllowedPaths } from '../../src/application-data/allowed-paths.ts'
import { CrowConfig } from '../../src/application-data/config.ts'
import { Runtime } from '../../src/application-data/runtime.ts'
import { Environment } from '../../src/application-data/env-vars.ts'
import { defaultFilesystem } from '../../src/application-data/filesystem.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'
import { fixturesDirectory } from '../support/fixtures.ts'

describe('AllowedPaths', () => {
  it('bounds write permissions to the working directory', async () => {
    const appData = mockApplicationData({
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: [],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
        },
      }),
    })

    const permissions = new AllowedPaths(appData).write()

    expect(await permissions.allows('src/app.ts')).toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })

  it('bounds write permissions to the working directory and configured write directories', async () => {
    const home = resolve(Deno.cwd(), '..', 'outside-home')
    const appData = mockApplicationData({
      envars: new Environment({
        runtimeEnvironment: { HOME: home },
        filesystem: defaultFilesystem(),
      }),
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: [],
          additionalRead: [],
          additionalWrite: ['~/docs'],
          escalateRead: [],
          escalateWrite: [],
        },
      }),
    })

    const permissions = new AllowedPaths(appData).write()

    expect(await permissions.allows(join(home, 'docs', 'a.txt'))).toBe(true)
    expect(await permissions.allows('src/app.ts')).toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })

  it('bounds read permissions to include configured write directories', async () => {
    const home = resolve(Deno.cwd(), '..', 'outside-home')
    const appData = mockApplicationData({
      envars: new Environment({
        runtimeEnvironment: { HOME: home },
        filesystem: defaultFilesystem(),
      }),
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: [],
          additionalRead: [],
          additionalWrite: ['~/work'],
          escalateRead: [],
          escalateWrite: [],
        },
      }),
    })

    const permissions = new AllowedPaths(appData).read()

    expect(await permissions.allows(join(home, 'work', 'a.txt'))).toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })

  it('bounds read permissions to the working directory and configured read directories', async () => {
    const home = resolve(Deno.cwd(), '..', 'outside-home')
    const appData = mockApplicationData({
      envars: new Environment({
        runtimeEnvironment: { HOME: home },
        filesystem: defaultFilesystem(),
      }),
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: [],
          additionalRead: ['~/docs'],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
        },
      }),
    })

    const permissions = new AllowedPaths(appData).read()

    expect(await permissions.allows(join(home, 'docs', 'a.txt'))).toBe(true)
    expect(await permissions.allows('src/app.ts')).toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })

  it('when the runtime has its own working directory, bounds write permissions to it', async () => {
    const appData = mockApplicationData()
    appData.runtime = new Runtime(Deno, join(fixturesDirectory, 'tools'))

    const permissions = new AllowedPaths(appData).write()

    expect(await permissions.allows(join(fixturesDirectory, 'tools', 'git')))
      .toBe(true)
    expect(await permissions.allows(join(fixturesDirectory, 'config.json')))
      .toBe(false)
  })

  it('when the runtime has its own working directory, bounds read permissions to it', async () => {
    const appData = mockApplicationData()
    appData.runtime = new Runtime(Deno, join(fixturesDirectory, 'tools'))

    const permissions = new AllowedPaths(appData).read()

    expect(await permissions.allows(join(fixturesDirectory, 'tools', 'git')))
      .toBe(true)
    expect(await permissions.allows(join(fixturesDirectory, 'config.json')))
      .toBe(false)
  })

  it('bounds git permissions to the repository root', async () => {
    const appData = mockApplicationData()
    appData.repositoryRoot = fixturesDirectory

    const permissions = new AllowedPaths(appData).git()

    expect(await permissions.allows(join(fixturesDirectory, 'config.json')))
      .toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })

  it('denies configured ignored directories for read', async () => {
    const appData = mockApplicationData({
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: ['vendor'],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
        },
      }),
    })

    const permissions = new AllowedPaths(appData).read()

    expect(await permissions.allows('vendor/a.txt')).toBe(false)
    expect(await permissions.allows('src/app.ts')).toBe(true)
  })

  it('denies configured ignored directories for write', async () => {
    const appData = mockApplicationData({
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: ['vendor'],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
        },
      }),
    })

    const permissions = new AllowedPaths(appData).write()

    expect(await permissions.allows('vendor/a.txt')).toBe(false)
    expect(await permissions.allows('src/app.ts')).toBe(true)
  })

  it('denies configured ignored directories and the repository .git for git', async () => {
    const appData = mockApplicationData({
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: [join(fixturesDirectory, 'vendor')],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
        },
      }),
    })
    appData.repositoryRoot = fixturesDirectory

    const permissions = new AllowedPaths(appData).git()

    expect(await permissions.allows(join(fixturesDirectory, 'vendor', 'a')))
      .toBe(false)
    expect(await permissions.allows(join(fixturesDirectory, '.git', 'config')))
      .toBe(false)
    expect(await permissions.allows(join(fixturesDirectory, 'config.json')))
      .toBe(true)
  })

  it('when asked twice, returns the same permissions', () => {
    const allowedPaths = new AllowedPaths(mockApplicationData())

    const first = allowedPaths.read()

    expect(allowedPaths.read()).toBe(first)
  })
})

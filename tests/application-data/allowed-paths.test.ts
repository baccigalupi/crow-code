import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path/join'
import { resolve } from '@std/path/resolve'
import { AllowedPaths } from '../../src/application-data/allowed-paths.ts'
import { CrowConfig } from '../../src/application-data/config.ts'
import { mockEnvironment } from '../support/mock-environment.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'
import { fixturesDirectory } from '../support/fixtures.ts'

describe('AllowedPaths', () => {
  it('bounds write permissions to the working directory', async () => {
    const appData = mockApplicationData({
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: { ignore: [], additionalRead: [], additionalWrite: [] },
      }),
    })

    const permissions = new AllowedPaths(appData).write()

    expect(await permissions.allows('src/app.ts')).toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })

  it('bounds write permissions to the working directory and configured write directories', async () => {
    const home = resolve(Deno.cwd(), '..', 'outside-home')
    const appData = mockApplicationData({
      envars: mockEnvironment({ HOME: home }),
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: [],
          additionalRead: [],
          additionalWrite: ['~/docs'],
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
      envars: mockEnvironment({ HOME: home }),
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: [],
          additionalRead: [],
          additionalWrite: ['~/work'],
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
      envars: mockEnvironment({ HOME: home }),
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: [],
          additionalRead: ['~/docs'],
          additionalWrite: [],
        },
      }),
    })

    const permissions = new AllowedPaths(appData).read()

    expect(await permissions.allows(join(home, 'docs', 'a.txt'))).toBe(true)
    expect(await permissions.allows('src/app.ts')).toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })

  it('bounds git permissions to the repository root', async () => {
    const appData = mockApplicationData()
    appData.repositoryRoot = fixturesDirectory

    const permissions = new AllowedPaths(appData).git()

    expect(await permissions.allows(join(fixturesDirectory, 'config.json')))
      .toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })

  it('when asked twice, returns the same permissions', () => {
    const allowedPaths = new AllowedPaths(mockApplicationData())

    const first = allowedPaths.read()

    expect(allowedPaths.read()).toBe(first)
  })
})

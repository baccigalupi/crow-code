import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { AppData } from '../../src/application-data/app-data.ts'
import { DenoRuntime } from '../../src/application-data/deno-runtime.ts'
import { Io } from '../../src/application-data/io.ts'
import { join } from '@std/path/join'
import { clearDirectory, fixturesDirectory } from '../support/fixtures.ts'

describe('AppData', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'logger')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'logger')))

  it('delegates io to the attribute', () => {
    const crowRepoDirectory = join(fixturesDirectory, 'logger')

    const appData = new AppData()
    appData.io = new Io(crowRepoDirectory)

    expect(appData.consoleLog()).toEqual(console.log)
  })

  it('delegates denoRuntime to the attribute', () => {
    const appData = new AppData()
    appData.denoRuntime = new DenoRuntime(Deno)

    const denoCommand = appData.denoCommand()

    expect(denoCommand).toBe(Deno.Command)
  })

  it('bounds path permissions to the working directory', async () => {
    const appData = new AppData()
    appData.denoRuntime = new DenoRuntime(Deno)

    const permissions = appData.pathPermissions()

    expect(await permissions.allows('src/app.ts')).toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })

  it('bounds git path permissions to the repository root', async () => {
    const appData = new AppData()
    appData.denoRuntime = new DenoRuntime(Deno)
    appData.repositoryRoot = fixturesDirectory

    const permissions = appData.gitPathPermissions()

    expect(await permissions.allows(join(fixturesDirectory, 'config.json')))
      .toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })
})

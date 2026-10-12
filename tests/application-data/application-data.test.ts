import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { stub } from '@std/testing/mock'
import { OpenAI } from 'openai'
import { ApplicationData } from '../../src/application-data/application-data.ts'
import { CrowConfig } from '../../src/application-data/config.ts'
import { DenoRuntime } from '../../src/application-data/deno-runtime.ts'
import { Io } from '../../src/application-data/io.ts'
import { join } from '@std/path/join'
import { clearDirectory, fixturesDirectory } from '../support/fixtures.ts'
import { createTestDatabase } from '../support/test-database.ts'
import { mockFetchSuccess } from '../support/mock-fetch.ts'
import { pino } from 'pino'

describe('ApplicationData', () => {
  beforeEach(async () => {
    await clearDirectory(join(fixturesDirectory, 'logger'))
    await clearDirectory(join(fixturesDirectory, 'database'))
  })
  afterEach(async () => {
    await clearDirectory(join(fixturesDirectory, 'logger'))
    await clearDirectory(join(fixturesDirectory, 'database'))
  })

  it('delegates io to the attribute', () => {
    const crowRepoDirectory = join(fixturesDirectory, 'logger')

    const appData = new ApplicationData()
    appData.io = new Io(crowRepoDirectory)

    expect(appData.consoleLog()).toEqual(console.log)
  })

  it('delegates denoRuntime to the attribute', () => {
    const appData = new ApplicationData()
    appData.denoRuntime = new DenoRuntime(Deno)

    const denoCommand = appData.denoCommand()

    expect(denoCommand).toBe(Deno.Command)
  })

  it('bounds path permissions to the working directory', async () => {
    const appData = new ApplicationData()
    appData.denoRuntime = new DenoRuntime(Deno)

    const permissions = appData.pathPermissions()

    expect(await permissions.allows('src/app.ts')).toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })

  it('bounds git path permissions to the repository root', async () => {
    const appData = new ApplicationData()
    appData.denoRuntime = new DenoRuntime(Deno)
    appData.repositoryRoot = fixturesDirectory

    const permissions = appData.gitPathPermissions()

    expect(await permissions.allows(join(fixturesDirectory, 'config.json')))
      .toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })

  it('opens the database in the crow global directory', async () => {
    const crowGlobalDirectory = join(fixturesDirectory, 'database')
    const appData = new ApplicationData()
    appData.denoRuntime = new DenoRuntime(Deno)
    appData.io = new Io(join(fixturesDirectory, 'logger'))
    appData.config = new CrowConfig('.', {
      crowGlobalDirectory,
      permissions: { ignore: [], additionalRead: [], additionalWrite: [] },
    })

    const database = await appData.database()

    expect(database.client.config.connection.filename).toBe(
      join(crowGlobalDirectory, 'crow.db'),
    )
    await database.destroy()
  })

  it('clones the data object with an injected database', async () => {
    const appData = new ApplicationData()
    const newDatabase = await createTestDatabase(pino({ enabled: false }))

    const clonedData = appData.withDatabase(newDatabase)

    expect(clonedData).not.toBe(appData)
    expect(await clonedData.database()).toBe(newDatabase)
  })

  it('when closed, destroys the database connection', async () => {
    const appData = new ApplicationData()
    appData.io = new Io(join(fixturesDirectory, 'logger'))
    appData.config = new CrowConfig('.', {
      crowGlobalDirectory: join(fixturesDirectory, 'database'),
      permissions: { ignore: [], additionalRead: [], additionalWrite: [] },
    })
    const database = await appData.database()

    await appData.close()

    await expect(database.raw('select 1')).rejects.toThrow()
  })

  it('when a chat client is built, applies the endpoint options and the defaults', async () => {
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: '' } }],
    })
    const appData = new ApplicationData()
    appData.io = new Io(join(fixturesDirectory, 'logger'))
    using _fetch = stub(globalThis, 'fetch', fetchMock)

    const client = appData.chatClient({
      apiKey: 'test-key',
      baseURL: 'https://example.com/v1',
    })
    await client.chat.completions.create({ model: 'test-model', messages: [] })

    expect(client).toBeInstanceOf(OpenAI)
    expect(client.timeout).toBe(20000)
    expect(client.maxRetries).toBe(2)
    expect(client.baseURL).toBe('https://example.com/v1')
    expect(fetchMock.calls).toHaveLength(1)
  })
})

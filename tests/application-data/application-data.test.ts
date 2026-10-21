import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { stub } from '@std/testing/mock'
import { OpenAI } from 'openai'
import { ApplicationData } from '../../src/application-data/application-data.ts'
import { CrowConfig } from '../../src/application-data/config.ts'
import { Runtime } from '../../src/application-data/runtime.ts'
import { defaultFilesystem } from '../../src/application-data/filesystem.ts'
import { Io } from '../../src/application-data/io.ts'
import { join } from '@std/path/join'
import { Environment } from '../../src/application-data/env-vars.ts'
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

  it('delegates console error to io', () => {
    const appData = new ApplicationData()
    appData.io = new Io(join(fixturesDirectory, 'logger'))

    const delegated = appData.consoleError()

    expect(delegated).toBe(console.error)
  })

  it('delegates fetch to io', () => {
    const appData = new ApplicationData()
    appData.io = new Io(join(fixturesDirectory, 'logger'))

    const delegated = appData.fetch()

    expect(delegated).toBe(globalThis.fetch)
  })

  it('delegates the logger to io', () => {
    const appData = new ApplicationData()
    appData.io = new Io(join(fixturesDirectory, 'logger'))

    const delegated = appData.logger()

    expect(delegated).toBe(appData.io.logger())
  })

  it('delegates write path permissions to allowedPaths', () => {
    const appData = new ApplicationData()
    appData.runtime = new Runtime(Deno)
    appData.config = new CrowConfig('.', {
      crowGlobalDirectory: join(fixturesDirectory, 'database'),
      envFile: join(fixturesDirectory, 'database', '.env'),
      permissions: {
        ignore: [],
        additionalRead: [],
        additionalWrite: [],
        escalateRead: [],
        escalateWrite: [],
        allowedLocalScripts: [],
      },
    })

    const delegated = appData.writePathPermissions()

    expect(delegated).toBe(appData.allowedPaths.write())
  })

  it('delegates read path permissions to allowedPaths', () => {
    const appData = new ApplicationData()
    appData.runtime = new Runtime(Deno)
    appData.config = new CrowConfig('.', {
      crowGlobalDirectory: join(fixturesDirectory, 'database'),
      envFile: join(fixturesDirectory, 'database', '.env'),
      permissions: {
        ignore: [],
        additionalRead: [],
        additionalWrite: [],
        escalateRead: [],
        escalateWrite: [],
        allowedLocalScripts: [],
      },
    })

    const delegated = appData.readPathPermissions()

    expect(delegated).toBe(appData.allowedPaths.read())
  })

  it('delegates git path permissions to allowedPaths', () => {
    const appData = new ApplicationData()
    appData.runtime = new Runtime(Deno)
    appData.repositoryRoot = fixturesDirectory
    appData.config = new CrowConfig('.', {
      crowGlobalDirectory: join(fixturesDirectory, 'database'),
      envFile: join(fixturesDirectory, 'database', '.env'),
      permissions: {
        ignore: [],
        additionalRead: [],
        additionalWrite: [],
        escalateRead: [],
        escalateWrite: [],
        allowedLocalScripts: [],
      },
    })

    const delegated = appData.gitPathPermissions()

    expect(delegated).toBe(appData.allowedPaths.git())
  })

  it('opens the database in the crow global directory', async () => {
    const crowGlobalDirectory = join(fixturesDirectory, 'database')
    const appData = new ApplicationData()
    appData.runtime = new Runtime(Deno)
    appData.filesystem = defaultFilesystem()
    appData.io = new Io(join(fixturesDirectory, 'logger'))
    appData.config = new CrowConfig('.', {
      crowGlobalDirectory,
      envFile: join(crowGlobalDirectory, '.env'),
      permissions: {
        ignore: [],
        additionalRead: [],
        additionalWrite: [],
        escalateRead: [],
        escalateWrite: [],
        allowedLocalScripts: [],
      },
    })
    appData.envars = new Environment({
      runtimeEnvironment: {},
      filesystem: defaultFilesystem(),
    })

    const database = await appData.database()

    expect(database.client.config.connection.filename).toBe(
      join(crowGlobalDirectory, 'crow.db'),
    )
    await database.destroy()
  })

  it('when the global directory starts with ~, opens the database under HOME', async () => {
    const home = join(fixturesDirectory, 'database')
    const appData = new ApplicationData()
    appData.runtime = new Runtime(Deno)
    appData.filesystem = defaultFilesystem()
    appData.io = new Io(join(fixturesDirectory, 'logger'))
    appData.config = new CrowConfig('.', {
      crowGlobalDirectory: '~/.crow',
      envFile: '~/.crow/.env',
      permissions: {
        ignore: [],
        additionalRead: [],
        additionalWrite: [],
        escalateRead: [],
        escalateWrite: [],
        allowedLocalScripts: [],
      },
    })
    appData.envars = new Environment({
      runtimeEnvironment: { HOME: home },
      filesystem: defaultFilesystem(),
    })

    const database = await appData.database()

    expect(database.client.config.connection.filename).toBe(
      join(home, '.crow', 'crow.db'),
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
    appData.runtime = new Runtime(Deno)
    appData.filesystem = defaultFilesystem()
    appData.io = new Io(join(fixturesDirectory, 'logger'))
    appData.config = new CrowConfig('.', {
      crowGlobalDirectory: join(fixturesDirectory, 'database'),
      envFile: join(fixturesDirectory, 'database', '.env'),
      permissions: {
        ignore: [],
        additionalRead: [],
        additionalWrite: [],
        escalateRead: [],
        escalateWrite: [],
        allowedLocalScripts: [],
      },
    })
    appData.envars = new Environment({
      runtimeEnvironment: {},
      filesystem: defaultFilesystem(),
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

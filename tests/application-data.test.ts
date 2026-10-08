import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { spy, stub } from '@std/testing/mock'
import pino from 'pino'
import { OpenAI } from 'openai'
import { ApplicationData } from '../src/application-data.ts'
import { Environment } from '../src/application-data/env-vars.ts'
import { clearDirectory, fixturesDirectory } from './support/fixtures.ts'
import { mockDenoCommand } from './support/mock-deno-command.ts'
import { mockFetchSuccess } from './support/mock-fetch.ts'
import { createTestDatabase } from './support/test-database.ts'
import { PathPermissions } from '../src/application-data/path-permissions.ts'

describe('ApplicationData', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'application-data')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'application-data')))

  it('when accessed, provides the application attributes', () => {
    const crowDirectory = join(
      fixturesDirectory,
      'application-data',
      'attributes',
    )

    const data = new ApplicationData({ crowDirectory })

    expect(data.crowDirectory()).toBe(crowDirectory)
    expect(data.consoleLog()).toBe(console.log)
    expect(data.args()).toEqual(Deno.args)
    expect(data.parsedArguments()).toEqual({ commands: [], options: {} })
    expect(data.logger().constructor.name).toBe('Pino')
    expect(data.fetch()).toBe(globalThis.fetch)
    expect(data.denoCommand()).toBe(Deno.Command)
    expect(data.getRealPath()).toBe(Deno.realPath)
    expect(data.pathPermissions()).toBeInstanceOf(PathPermissions)
    expect(data.envars()).toBeInstanceOf(Environment)
  })

  it('when git path permissions are requested twice, returns the cached permissions', () => {
    const data = new ApplicationData()
    using _denoCommand = stub(
      data,
      'denoCommand',
      () => mockDenoCommand({ commandSpy: spy(), stdout: `${Deno.cwd()}\n` }),
    )
    using _logger = stub(data, 'logger', () => pino({ enabled: false }))

    const permissions = data.gitPathPermissions()

    expect(data.gitPathPermissions()).toBe(permissions)
  })

  it('clones the whole data object allowing the injection of an new database when needing a transaction', async () => {
    const crowDirectory = join(
      fixturesDirectory,
      'application-data',
      'attributes',
    )
    const data = new ApplicationData({ crowDirectory })

    const newDatabase = await createTestDatabase(pino({ enabled: false }))
    const clonedData = data.withDatabase(newDatabase)
    const originalDatabase = await data.database()

    expect(clonedData).not.toBe(data)
    expect(await clonedData.database()).toBe(newDatabase)
    expect(await data.database()).not.toBe(newDatabase)
    await originalDatabase.destroy()
  })

  it('opens and auto-migrates the database', async () => {
    const crowDirectory = join(
      fixturesDirectory,
      'application-data',
      'attributes',
    )
    const data = new ApplicationData({ crowDirectory })

    const database = await data.database()

    expect(await database.schema.hasTable('providers')).toBe(true)
    expect(await data.database()).toBe(database)
  })

  it('when closed, destroys the database connection', async () => {
    const crowDirectory = join(fixturesDirectory, 'application-data', 'close')
    const data = new ApplicationData({ crowDirectory })
    const database = await data.database()

    await data.close()

    await expect(database.raw('select 1')).rejects.toThrow()
  })

  it('when a chat client is built, applies the endpoint options and the defaults', async () => {
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: '' } }],
    })
    const data = new ApplicationData()
    using _fetch = stub(globalThis, 'fetch', fetchMock)

    const client = data.chatClient({
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

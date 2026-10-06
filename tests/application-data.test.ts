import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { returnsNext, spy, stub } from '@std/testing/mock'
import pino from 'pino'
import { OpenAI } from 'openai'
import { ApplicationData } from '../src/application-data.ts'
import { Environment } from '../src/env-vars.ts'
import { clearDirectory, fixturesDirectory } from './support/fixtures.ts'
import { mockFetchSuccess } from './support/mock-fetch.ts'

describe('ApplicationData', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'application-data')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'application-data')))

  it('when asked for the crow directory, returns .crow under the current working directory', () => {
    const data = new ApplicationData()

    const directory = data.crowDirectory()

    expect(directory).toBe(join(Deno.cwd(), '.crow'))
  })

  it('when asked for fetch, returns the global fetch function', () => {
    const data = new ApplicationData()

    const fetchFunction = data.fetch()

    expect(fetchFunction).toBe(globalThis.fetch)
  })

  it('when asked for the deno command, returns the Deno.Command constructor', () => {
    const data = new ApplicationData()

    const command = data.denoCommand()

    expect(command).toBe(Deno.Command)
  })

  it('when asked for console log, returns console.log', () => {
    const data = new ApplicationData()

    const consoleLog = data.consoleLog()

    expect(consoleLog).toBe(console.log)
  })

  it('when path permissions allows is called twice for the same path, resolves the path once', async () => {
    const data = new ApplicationData()
    const directory = Deno.cwd()
    const mockDenoRealPath = spy(
      returnsNext([Promise.resolve(join(directory, 'deno.json'))]),
    )
    using _realPath = stub(
      data,
      'getRealPath',
      () => mockDenoRealPath,
    )

    const permissions = data.pathPermissions()
    await permissions.allows('deno.json')
    await permissions.allows('deno.json')

    expect(mockDenoRealPath.calls).toHaveLength(1)
    expect(data.pathPermissions()).toBe(permissions)
  })

  it('when asked for args, returns the process arguments', () => {
    const data = new ApplicationData()

    const args = data.args()

    expect(args).toEqual(Deno.args)
  })

  it('when parsed arguments are requested twice, returns the cached result', () => {
    const data = new ApplicationData()
    using _args = stub(
      data,
      'args',
      () => ['add-provider', '--name=x'],
    )

    const parsed = data.parsedArguments()

    expect(data.parsedArguments()).toBe(parsed)
  })

  it('when the logger is requested twice, returns the cached logger', () => {
    const crowDirectory = join(fixturesDirectory, 'application-data', 'logger')
    const data = new ApplicationData()
    using _crowDirectory = stub(data, 'crowDirectory', () => crowDirectory)

    const logger = data.logger()

    expect(data.logger()).toBe(logger)
  })

  it('when the database is requested twice, returns the cached database', async () => {
    const crowDirectory = join(
      fixturesDirectory,
      'application-data',
      'database',
    )
    const data = new ApplicationData()
    using _crowDirectory = stub(data, 'crowDirectory', () => crowDirectory)
    using _logger = stub(data, 'logger', () => pino({ enabled: false }))

    const database = await data.database()

    expect(await data.database()).toBe(database)
    await database.destroy()
  })

  it('when closed, destroys the database connection', async () => {
    const crowDirectory = join(fixturesDirectory, 'application-data', 'close')
    const data = new ApplicationData()
    using _crowDirectory = stub(data, 'crowDirectory', () => crowDirectory)
    using _logger = stub(data, 'logger', () => pino({ enabled: false }))
    const database = await data.database()

    await data.close()

    await expect(database.raw('select 1')).rejects.toThrow()
  })

  it('when a chat client is built, applies the endpoint options and the defaults', async () => {
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: '' } }],
    })
    const data = new ApplicationData()
    using _fetch = stub(data, 'fetch', () => fetchMock)

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

  it('when envars are requested twice, loads the environment once', () => {
    const data = new ApplicationData()

    const envars = data.envars()

    expect(envars).toBeInstanceOf(Environment)
    expect(data.envars()).toBe(envars)
  })
})

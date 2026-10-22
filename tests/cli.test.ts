import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import pino from 'pino'
import { run } from '../src/cli.ts'
import { clearDirectory, fixturesDirectory } from './support/fixtures.ts'
import { mockApplicationData } from './support/mock-application-data.ts'
import { mockFetchRoutes } from './support/mock-fetch.ts'
import { mockCommand } from './support/mock-command.ts'

describe('run', () => {
  beforeEach(async () => {
    await clearDirectory(join(fixturesDirectory, 'cli', '.crow'))
    await clearDirectory(join(fixturesDirectory, 'cli', 'crow-global'))
  })
  afterEach(async () => {
    await clearDirectory(join(fixturesDirectory, 'cli', '.crow'))
    await clearDirectory(join(fixturesDirectory, 'cli', 'crow-global'))
  })

  it('when create-model-catalog is requested, populates the model catalog', async () => {
    const fetchMock = mockFetchRoutes([['pile-driver', { models: [] }]])
    const applicationData = mockApplicationData({
      args: ['create-model-catalog'],
      fetch: fetchMock,
    })
    const database = await applicationData.database()
    await database('providers').insert({
      name: 'ollama',
      base_url: 'http://pile-driver.local:11434',
      models_path: '/api/tags',
      api_key_env_var: null,
    })

    await run(applicationData)

    expect(fetchMock.calls).toHaveLength(1)
  })

  it('when add-provider is requested, creates the provider', async () => {
    const applicationData = mockApplicationData({
      args: [
        'add-provider',
        '--name=ollama',
        '--base-url=http://x',
        '--api-key-env-var=OLLAMA_KEY',
      ],
      consoleLog: () => {},
    })
    const database = await applicationData.database()

    await run(applicationData)

    const rows = await database('providers').select('*')
    expect(rows).toEqual([
      {
        id: expect.any(Number),
        name: 'ollama',
        base_url: 'http://x',
        models_path: null,
        api_key_env_var: 'OLLAMA_KEY',
      },
    ])
  })

  it('when git-commit is requested without a goal, reports the error on stderr and exits with code 1', async () => {
    const consoleLog = mock()
    const consoleError = mock()
    const exit = mock()
    const applicationData = mockApplicationData({
      args: ['git-commit', 'src/a.ts'],
      consoleLog,
      consoleError,
      exit,
    })

    await run(applicationData)

    expect(exit.mock.calls).toHaveLength(1)
    expect(exit).toHaveBeenNthCalledWith(1, 1)
    expect(consoleError.mock.calls[0][0]).toBe(
      'Error: missing --goal=<goal> for git-commit',
    )
    expect(consoleLog.mock.calls).toHaveLength(0)
  })

  it('when the command succeeds, exits with code 0', async () => {
    const exit = mock()
    const applicationData = mockApplicationData({
      args: ['-V'],
      consoleLog: () => {},
      exit,
    })

    await run(applicationData)

    expect(exit.mock.calls).toHaveLength(1)
    expect(exit).toHaveBeenNthCalledWith(1, 0)
  })

  it('when the command throws, logs the error and exits with code 1', async () => {
    const logger = pino({ enabled: false })
    const error = spyOn(logger, 'error')
    const exit = mock()
    const applicationData = mockApplicationData({
      args: ['-V'],
      logger,
      consoleLog: () => {
        throw new Error('boom')
      },
      exit,
    })

    await run(applicationData)

    expect(exit).toHaveBeenNthCalledWith(1, 1)
    expect(error.mock.calls).toHaveLength(1)
  })

  it('when git-commit is requested, does not write usage', async () => {
    const consoleLog = mock()
    const consoleError = mock()
    const applicationData = mockApplicationData({
      args: ['git-commit', '--goal=add login'],
      consoleLog,
      consoleError,
      command: mockCommand({ success: false }),
    })

    await run(applicationData)

    expect(consoleLog.mock.calls).toHaveLength(0)
    expect(consoleError.mock.calls[0][0]).not.toContain('Usage: crow <command>')
  })

  it('when the command is unknown, prints out a help message', async () => {
    const consoleLog = mock()
    const applicationData = mockApplicationData({
      args: ['unknown'],
      consoleLog,
    })

    await run(applicationData)

    expect(consoleLog.mock.calls[0][0]).toContain('Usage: crow <command>')
  })

  it('when -h is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const applicationData = mockApplicationData({
      args: ['-h'],
      consoleLog: (summary: string) => outputs.push(summary),
      fetch: (() => {
        throw new Error('fetch should not be called')
      }) as unknown as typeof fetch,
    })

    await run(applicationData)

    expect(outputs[0]).toContain('Usage: crow')
    expect(outputs[0]).toContain(
      'create-model-catalog   populate models from configured providers',
    )
  })

  it('when --help is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const applicationData = mockApplicationData({
      args: ['--help'],
      consoleLog: (summary: string) => outputs.push(summary),
      fetch: (() => {
        throw new Error('fetch should not be called')
      }) as unknown as typeof fetch,
    })

    await run(applicationData)

    expect(outputs[0]).toContain('Usage: crow')
    expect(outputs[0]).toContain(
      'create-model-catalog   populate models from configured providers',
    )
  })

  it('when -V is passed, writes the version without invoking command dependencies', async () => {
    const outputs: string[] = []
    const applicationData = mockApplicationData({
      args: ['-V'],
      consoleLog: (summary: string) => outputs.push(summary),
      fetch: (() => {
        throw new Error('fetch should not be called')
      }) as unknown as typeof fetch,
    })

    await run(applicationData)

    expect(outputs[0]).toBe('crow 0.0.1')
  })

  it('when --version is passed, writes the version without invoking command dependencies', async () => {
    const outputs: string[] = []
    const applicationData = mockApplicationData({
      args: ['--version'],
      consoleLog: (summary: string) => outputs.push(summary),
      fetch: (() => {
        throw new Error('fetch should not be called')
      }) as unknown as typeof fetch,
    })

    await run(applicationData)

    expect(outputs[0]).toBe('crow 0.0.1')
  })

  it('when a command finishes, closes the application data', async () => {
    const applicationData = mockApplicationData({
      args: ['-V'],
      consoleLog: () => {},
    })
    const close = spyOn(applicationData, 'close').mockImplementation(() =>
      Promise.resolve(),
    )

    await run(applicationData)

    expect(close.mock.calls).toHaveLength(1)
  })

  it('when an unsupported option is passed, writes usage without invoking command dependencies', async () => {
    const consoleLog = mock()
    const applicationData = mockApplicationData({
      args: ['--unknown'],
      consoleLog,
      fetch: (() => {
        throw new Error('fetch should not be called')
      }) as unknown as typeof fetch,
    })

    await run(applicationData)

    expect(consoleLog.mock.calls[0][0]).toContain('Usage: crow <command>')
  })

  it('when no application data is given, builds it from the process', async () => {
    const argv = process.argv
    process.argv = [
      'bun',
      'crow',
      '-V',
      `--config=${join(fixturesDirectory, 'config.json')}`,
    ]
    const exit = spyOn(process, 'exit').mockImplementation(
      () => undefined as never,
    )
    const log = spyOn(console, 'log').mockImplementation(() => {})

    await run()
    process.argv = argv
    await clearDirectory(join(fixturesDirectory, '.crow'))

    expect(log).toHaveBeenNthCalledWith(1, 'crow 0.0.1')
    expect(exit).toHaveBeenNthCalledWith(1, 0)
  })

  it('when no arguments are given, launches the repl and exits on interrupt', async () => {
    const cwd = join(fixturesDirectory, 'cli')
    await mkdir(join(cwd, '.crow'), { recursive: true })
    await writeFile(
      join(cwd, '.crow', 'config.json'),
      JSON.stringify({
        crowGlobalDirectory: 'crow-global',
        envFile: 'crow-global/.env',
        permissions: {
          ignore: [],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
          allowedLocalScripts: [],
        },
      }),
    )

    const child = spawn(
      process.execPath,
      [join(process.cwd(), 'bin', 'crow')],
      {
        cwd,
        stdio: 'ignore',
        signal: AbortSignal.timeout(60_000),
      },
    )
    const exitCode = new Promise<number | null>((resolve) => {
      child.once('exit', (code) => resolve(code))
    })
    // The sqlite file proves the real builder opened and migrated the database;
    // the buffer covers the remaining gap to Runner.listen() registering SIGINT.
    while (!existsSync(join(cwd, 'crow-global', 'crow.db'))) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000))

    child.kill('SIGINT')
    expect(await exitCode).toBe(1)
  }, 60_000)
})

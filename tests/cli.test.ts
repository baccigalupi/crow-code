import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { exists } from '@std/fs'
import { join } from '@std/path'
import { assertSpyCall, assertSpyCalls, spy, stub } from '@std/testing/mock'
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
    expect(rows).toEqual([{
      id: expect.any(Number),
      name: 'ollama',
      base_url: 'http://x',
      models_path: null,
      api_key_env_var: 'OLLAMA_KEY',
    }])
  })

  it('when git-commit is requested without a goal, reports the error on stderr and exits with code 1', async () => {
    const consoleLog = mock.fn()
    const consoleError = mock.fn()
    const exit = spy()
    const applicationData = mockApplicationData({
      args: ['git-commit', 'src/a.ts'],
      consoleLog,
      consoleError,
      exit,
    })

    await run(applicationData)

    assertSpyCalls(exit, 1)
    assertSpyCall(exit, 0, { args: [1] })
    expect(consoleError.mock.calls[0].arguments[0]).toBe(
      'Error: missing --goal=<goal> for git-commit',
    )
    expect(consoleLog.mock.calls).toHaveLength(0)
  })

  it('when the command succeeds, exits with code 0', async () => {
    const exit = spy()
    const applicationData = mockApplicationData({
      args: ['-V'],
      consoleLog: () => {},
      exit,
    })

    await run(applicationData)

    assertSpyCalls(exit, 1)
    assertSpyCall(exit, 0, { args: [0] })
  })

  it('when the command throws, logs the error and exits with code 1', async () => {
    const logger = pino({ enabled: false })
    using error = spy(logger, 'error')
    const exit = spy()
    const applicationData = mockApplicationData({
      args: ['-V'],
      logger,
      consoleLog: () => {
        throw new Error('boom')
      },
      exit,
    })

    await run(applicationData)

    assertSpyCall(exit, 0, { args: [1] })
    expect(error.calls).toHaveLength(1)
  })

  it('when git-commit is requested, does not write usage', async () => {
    const consoleLog = mock.fn()
    const consoleError = mock.fn()
    const applicationData = mockApplicationData({
      args: ['git-commit', '--goal=add login'],
      consoleLog,
      consoleError,
      command: mockCommand({ success: false }),
    })

    await run(applicationData)

    expect(consoleLog.mock.calls).toHaveLength(0)
    expect(consoleError.mock.calls[0].arguments[0]).not.toContain(
      'Usage: crow <command>',
    )
  })

  it('when the command is unknown, prints out a help message', async () => {
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: ['unknown'],
      consoleLog,
    })

    await run(applicationData)

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })

  it('when -h is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const applicationData = mockApplicationData({
      args: ['-h'],
      consoleLog: (summary: string) => outputs.push(summary),
      fetch: () => {
        throw new Error('fetch should not be called')
      },
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
      fetch: () => {
        throw new Error('fetch should not be called')
      },
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
      fetch: () => {
        throw new Error('fetch should not be called')
      },
    })

    await run(applicationData)

    expect(outputs[0]).toBe('crow 0.0.1')
  })

  it('when --version is passed, writes the version without invoking command dependencies', async () => {
    const outputs: string[] = []
    const applicationData = mockApplicationData({
      args: ['--version'],
      consoleLog: (summary: string) => outputs.push(summary),
      fetch: () => {
        throw new Error('fetch should not be called')
      },
    })

    await run(applicationData)

    expect(outputs[0]).toBe('crow 0.0.1')
  })

  it('when a command finishes, closes the application data', async () => {
    const applicationData = mockApplicationData({
      args: ['-V'],
      consoleLog: () => {},
    })
    using close = stub(applicationData, 'close', () => Promise.resolve())

    await run(applicationData)

    expect(close.calls).toHaveLength(1)
  })

  it('when an unsupported option is passed, writes usage without invoking command dependencies', async () => {
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: ['--unknown'],
      consoleLog,
      fetch: () => {
        throw new Error('fetch should not be called')
      },
    })

    await run(applicationData)

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })

  it('when no arguments are given, launches the repl and exits on interrupt', async () => {
    const cwd = join(fixturesDirectory, 'cli')
    await Deno.mkdir(join(cwd, '.crow'), { recursive: true })
    await Deno.writeTextFile(
      join(cwd, '.crow', 'config.json'),
      JSON.stringify({
        crowGlobalDirectory: 'crow-global',
        envFile: 'crow-global/.env',
        permissions: {
          ignore: [],
          additionalRead: [],
          additionalWrite: [],
        },
      }),
    )

    const child = new Deno.Command(Deno.execPath(), {
      args: [
        'run',
        '--allow-read',
        '--allow-write',
        '--allow-env',
        '--allow-net',
        '--allow-ffi',
        '--allow-run=git',
        '--allow-sys=hostname',
        join(Deno.cwd(), 'bin', 'crow'),
      ],
      cwd,
      env: {
        DENO_COVERAGE_DIR: Deno.env.get('DENO_COVERAGE_DIR') ??
          join(Deno.cwd(), 'coverage'),
      },
      stdin: 'null',
      stdout: 'null',
      stderr: 'null',
      signal: AbortSignal.timeout(60_000),
    }).spawn()
    // The sqlite file proves the real builder opened and migrated the database;
    // the buffer covers the remaining gap to Runner.listen() registering SIGINT.
    while (!await exists(join(cwd, 'crow-global', 'crow.db'))) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000))

    child.kill('SIGINT')
    const status = await child.status
    expect(status.code).toBe(1)
  })
})

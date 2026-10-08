import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { spy, stub } from '@std/testing/mock'
import pino from 'pino'
import { run } from '../src/cli.ts'
import { openAndMigrateDatabase } from '../src/database/open-and-migrate-database.ts'
import { clearDirectory, fixturesDirectory } from './support/fixtures.ts'
import { mockApplicationData } from './support/mock-application-data.ts'
import { mockFetchRoutes } from './support/mock-fetch.ts'
import { mockDenoCommand } from './support/mock-deno-command.ts'

describe('run', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'cli', '.crow')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'cli', '.crow')))

  it('when create-model-catalog is requested, populates the model catalog', async () => {
    const database = await openAndMigrateDatabase(
      join(fixturesDirectory, 'cli', '.crow'),
      pino({ enabled: false }),
    )
    await database('providers').insert({
      name: 'ollama',
      base_url: 'http://pile-driver.local:11434',
      models_path: '/api/tags',
      api_key_env_var: null,
    })
    const fetchMock = mockFetchRoutes([['pile-driver', { models: [] }]])
    const applicationData = mockApplicationData({
      args: ['create-model-catalog'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      database,
      fetch: fetchMock,
    })

    await run(applicationData, () => {})

    expect(fetchMock.calls).toHaveLength(1)
  })

  it('when add-provider is requested, creates the provider', async () => {
    const database = await openAndMigrateDatabase(
      join(fixturesDirectory, 'cli', '.crow'),
      pino({ enabled: false }),
    )
    const applicationData = mockApplicationData({
      args: [
        'add-provider',
        '--name=ollama',
        '--base-url=http://x',
        '--api-key-env-var=OLLAMA_KEY',
      ],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      database,
      consoleLog: () => {},
    })

    await run(applicationData, () => {})

    const rows = await database('providers').select('*')
    expect(rows).toEqual([{
      id: expect.any(Number),
      name: 'ollama',
      base_url: 'http://x',
      models_path: null,
      api_key_env_var: 'OLLAMA_KEY',
    }])
  })

  it('when git-commit is requested without a goal, exits with a non-zero code', async () => {
    const consoleLog = mock.fn()
    const quit = mock.fn()
    const applicationData = mockApplicationData({
      args: ['git-commit', 'src/a.ts'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog,
    })

    const exitCode = await run(applicationData, quit)

    expect(exitCode).not.toBe(0)
    expect(quit.mock.calls[0].arguments[0]).toBe(exitCode)
    expect(consoleLog.mock.calls[0].arguments[0]).toContain('--goal')
  })

  it('when no quit handler is given, exits the process with the code', async () => {
    const exit = mock.fn()
    using _exit = stub(Deno, 'exit', exit as unknown as typeof Deno.exit)
    const applicationData = mockApplicationData({
      args: ['-V'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog: () => {},
    })

    const exitCode = await run(applicationData)

    expect(exitCode).toBe(0)
    expect(exit.mock.calls[0].arguments[0]).toBe(0)
  })

  it('when the command succeeds, exits with code 0', async () => {
    const quit = mock.fn()
    const applicationData = mockApplicationData({
      args: ['-V'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog: () => {},
    })

    const exitCode = await run(applicationData, quit)

    expect(exitCode).toBe(0)
    expect(quit.mock.calls[0].arguments[0]).toBe(0)
  })

  it('when the command throws, logs the error and exits with a non-zero code', async () => {
    const logger = pino({ enabled: false })
    using error = spy(logger, 'error')
    const quit = mock.fn()
    const applicationData = mockApplicationData({
      args: ['-V'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      logger,
    })
    using _ = stub(applicationData, 'parsedArguments', () => {
      throw new Error('boom')
    })

    const exitCode = await run(applicationData, quit)

    expect(exitCode).not.toBe(0)
    expect(quit.mock.calls[0].arguments[0]).toBe(exitCode)
    expect(error.calls).toHaveLength(1)
  })

  it('when git-commit is requested, does not write usage', async () => {
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: ['git-commit', '--goal=add login'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog,
      denoCommand: mockDenoCommand({ success: false }),
    })

    await run(applicationData, () => {})

    expect(consoleLog.mock.calls[0].arguments[0]).not.toContain(
      'Usage: crow <command>',
    )
  })

  it('when the command is unknown, prints out a help message', async () => {
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: ['unknown'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog,
    })

    await run(applicationData, () => {})

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })

  it('when -h is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const applicationData = mockApplicationData({
      args: ['-h'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog: (summary: string) => outputs.push(summary),
      fetch: () => {
        throw new Error('fetch should not be called')
      },
    })

    await run(applicationData, () => {})

    expect(outputs[0]).toContain('Usage: crow')
    expect(outputs[0]).toContain(
      'create-model-catalog   populate models from configured providers',
    )
  })

  it('when --help is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const applicationData = mockApplicationData({
      args: ['--help'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog: (summary: string) => outputs.push(summary),
      fetch: () => {
        throw new Error('fetch should not be called')
      },
    })

    await run(applicationData, () => {})

    expect(outputs[0]).toContain('Usage: crow')
    expect(outputs[0]).toContain(
      'create-model-catalog   populate models from configured providers',
    )
  })

  it('when -V is passed, writes the version without invoking command dependencies', async () => {
    const outputs: string[] = []
    const applicationData = mockApplicationData({
      args: ['-V'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog: (summary: string) => outputs.push(summary),
      fetch: () => {
        throw new Error('fetch should not be called')
      },
    })

    await run(applicationData, () => {})

    expect(outputs[0]).toBe('crow 0.0.1')
  })

  it('when --version is passed, writes the version without invoking command dependencies', async () => {
    const outputs: string[] = []
    const applicationData = mockApplicationData({
      args: ['--version'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog: (summary: string) => outputs.push(summary),
      fetch: () => {
        throw new Error('fetch should not be called')
      },
    })

    await run(applicationData, () => {})

    expect(outputs[0]).toBe('crow 0.0.1')
  })

  it('when a command finishes, closes the application data', async () => {
    const close = mock.fn(() => Promise.resolve())
    const applicationData = mockApplicationData({
      args: ['-V'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      close,
      consoleLog: () => {},
    })

    await run(applicationData, () => {})

    expect(close.mock.calls).toHaveLength(1)
  })

  it('when an unsupported option is passed, writes usage without invoking command dependencies', async () => {
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: ['--unknown'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog,
      fetch: () => {
        throw new Error('fetch should not be called')
      },
    })

    await run(applicationData, () => {})

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })
})

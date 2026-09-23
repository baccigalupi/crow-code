import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import type { Logger } from '../src/types.ts'
import { run } from '../src/cli.ts'
import { clearDirectory, fixturesDirectory } from './support/fixtures.ts'
import { mockFetchRoutes } from './support/mock-fetch.ts'
import pino from 'pino'

const crowDirectory = join(fixturesDirectory, 'cli', '.crow')

describe('run', () => {
  it('when the generated summary is empty, does not commit', async () => {
    const logger = { error: () => {} } as unknown as Logger
    const commits: string[] = []
    const commit = (summary: string) => {
      commits.push(summary)
      return Promise.resolve(true)
    }

    await run(
      ['git-commit'],
      crowDirectory,
      logger,
      () => {},
      commit,
    )

    expect(commits).toEqual([])
  })

  it('when find-models is requested, builds the model catalog', async () => {
    await clearDirectory(crowDirectory)
    await Deno.mkdir(crowDirectory, { recursive: true })
    await Deno.writeTextFile(
      join(crowDirectory, 'providers.json'),
      JSON.stringify({
        providers: [{
          name: 'ollama',
          baseUrl: 'http://pile-driver.local:11434',
          modelsUrl: 'http://pile-driver.local:11434/api/tags',
        }],
      }),
    )
    const logger = pino({ enabled: false })
    const fetchMock = mockFetchRoutes([['pile-driver', { models: [] }]])

    await run(
      ['find-models'],
      crowDirectory,
      logger,
      () => {},
      undefined,
      fetchMock,
    )

    expect(fetchMock.calls).toHaveLength(1)
    expect(Deno.statSync(join(crowDirectory, 'models.json')).isFile).toBe(true)
    await clearDirectory(crowDirectory)
  })

  it('when the command is unknown, writes usage', async () => {
    const logger = { error: () => {} } as unknown as Logger
    const consoleLog = mock.fn()

    await run(['unknown'], crowDirectory, logger, consoleLog)

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })

  it('when -h is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const logger = { error: () => {} } as unknown as Logger

    await run(
      ['-h'],
      crowDirectory,
      logger,
      (summary: string) => outputs.push(summary),
      () => {
        throw new Error('commit should not be called')
      },
      () => {
        throw new Error('fetch should not be called')
      },
    )

    expect(outputs[0]).toContain('Usage: crow')
    expect(outputs[0]).toContain('find-models')
    expect(outputs[0]).toContain('git-commit')
  })

  it('when --help is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const logger = { error: () => {} } as unknown as Logger

    await run(
      ['--help'],
      crowDirectory,
      logger,
      (summary: string) => outputs.push(summary),
      () => {
        throw new Error('commit should not be called')
      },
      () => {
        throw new Error('fetch should not be called')
      },
    )

    expect(outputs[0]).toContain('Usage: crow')
    expect(outputs[0]).toContain('find-models')
    expect(outputs[0]).toContain('git-commit')
  })

  it('when -V is passed, writes the version without invoking command dependencies', async () => {
    const outputs: string[] = []
    const logger = { error: () => {} } as unknown as Logger

    await run(
      ['-V'],
      crowDirectory,
      logger,
      (summary: string) => outputs.push(summary),
      () => {
        throw new Error('commit should not be called')
      },
      () => {
        throw new Error('fetch should not be called')
      },
    )

    expect(outputs[0]).toBe('crow 0.0.1')
  })

  it('when --version is passed, writes the version without invoking command dependencies', async () => {
    const outputs: string[] = []
    const logger = { error: () => {} } as unknown as Logger

    await run(
      ['--version'],
      crowDirectory,
      logger,
      (summary: string) => outputs.push(summary),
      () => {
        throw new Error('commit should not be called')
      },
      () => {
        throw new Error('fetch should not be called')
      },
    )

    expect(outputs[0]).toBe('crow 0.0.1')
  })

  it('when an unsupported option is passed, writes usage without invoking command dependencies', async () => {
    const logger = { error: () => {} } as unknown as Logger
    const consoleLog = mock.fn()

    await run(
      ['--unknown'],
      crowDirectory,
      logger,
      consoleLog,
      () => {
        throw new Error('commit should not be called')
      },
      () => {
        throw new Error('fetch should not be called')
      },
    )

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })
})

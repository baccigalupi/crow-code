import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import type { Logger } from '../src/types.ts'
import { run } from '../src/cli.ts'

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
      logger,
      () => {},
      commit,
    )

    expect(commits).toEqual([])
  })

  it('when find-models is requested, builds the model catalog', async () => {
    const logger = { error: () => {} } as unknown as Logger
    const directories: string[] = []
    const buildCatalog = (crowDirectory: string) => {
      directories.push(crowDirectory)
      return Promise.resolve()
    }

    await run(
      ['find-models'],
      logger,
      undefined,
      undefined,
      buildCatalog,
    )

    expect(directories).toEqual([`${Deno.cwd()}/.crow`])
  })

  it('when the command is unknown, writes usage', async () => {
    const logger = { error: () => {} } as unknown as Logger
    const consoleLog = mock.fn()

    await run(['unknown'], logger, consoleLog)

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })

  it('when -h is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const logger = { error: () => {} } as unknown as Logger

    await run(
      ['-h'],
      logger,
      (summary: string) => outputs.push(summary),
      () => {
        throw new Error('commit should not be called')
      },
      () => {
        throw new Error('buildCatalog should not be called')
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
      logger,
      (summary: string) => outputs.push(summary),
      () => {
        throw new Error('commit should not be called')
      },
      () => {
        throw new Error('buildCatalog should not be called')
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
      logger,
      (summary: string) => outputs.push(summary),
      () => {
        throw new Error('commit should not be called')
      },
      () => {
        throw new Error('buildCatalog should not be called')
      },
    )

    expect(outputs[0]).toBe('crow 0.0.1')
  })

  it('when --version is passed, writes the version without invoking command dependencies', async () => {
    const outputs: string[] = []
    const logger = { error: () => {} } as unknown as Logger

    await run(
      ['--version'],
      logger,
      (summary: string) => outputs.push(summary),
      () => {
        throw new Error('commit should not be called')
      },
      () => {
        throw new Error('buildCatalog should not be called')
      },
    )

    expect(outputs[0]).toBe('crow 0.0.1')
  })

  it('when an unsupported option is passed, writes usage without invoking command dependencies', async () => {
    const logger = { error: () => {} } as unknown as Logger
    const consoleLog = mock.fn()

    await run(
      ['--unknown'],
      logger,
      consoleLog,
      () => {
        throw new Error('commit should not be called')
      },
      () => {
        throw new Error('buildCatalog should not be called')
      },
    )

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })
})

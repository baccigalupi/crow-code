import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import type { Logger } from '../src/model-info/types.ts'
import { run } from '../src/cli.ts'

describe('run', () => {
  it('when git-commit is requested, forwards the diff and remaining text and writes the summary', async () => {
    const errors: string[] = []
    const logger = {
      error: (message: unknown) => errors.push(String(message)),
    } as unknown as Logger
    const getDiff = () => Promise.resolve('current diff')
    const requests: string[][] = []
    const requestSummary = (
      _crowDirectory: string,
      diff: string,
      goal: string,
    ) => {
      requests.push([diff, goal])
      return Promise.resolve('Add git commit summaries')
    }
    const summaries: string[] = []
    const consoleLog = (summary: string) => summaries.push(summary)
    const commits: string[] = []
    const commit = (summary: string) => {
      commits.push(summary)
      return Promise.resolve(true)
    }

    await run(
      ['git-commit', 'ship', 'the', 'command'],
      logger,
      getDiff,
      requestSummary,
      consoleLog,
      commit,
    )

    expect(requests).toEqual([['current diff', 'ship the command']])
    expect(summaries).toEqual(['Add git commit summaries'])
    expect(commits).toEqual(['Add git commit summaries'])
    expect(errors).toEqual([])
  })

  it('when the generated summary is empty, does not commit', async () => {
    const logger = { error: () => {} } as unknown as Logger
    const getDiff = () => Promise.resolve('current diff')
    const requestSummary = () => Promise.resolve('')
    const commits: string[] = []
    const commit = (summary: string) => {
      commits.push(summary)
      return Promise.resolve(true)
    }

    await run(
      ['git-commit'],
      logger,
      getDiff,
      requestSummary,
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
      undefined,
      undefined,
      buildCatalog,
    )

    expect(directories).toEqual([`${Deno.cwd()}/.crow`])
  })

  it('when the command is unknown, logs usage', async () => {
    const errors: string[] = []
    const logger = {
      error: (message: unknown) => errors.push(String(message)),
    } as unknown as Logger

    await run(['unknown'], logger)

    expect(errors[0]).toContain('Usage: crow <subcommand>')
    expect(errors[0]).toContain('find-models')
    expect(errors[0]).toContain('git-commit')
  })

  it('when -h is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const logger = { error: () => {} } as unknown as Logger

    await run(
      ['-h'],
      logger,
      () => {
        throw new Error('readDiff should not be called')
      },
      () => {
        throw new Error('requestSummary should not be called')
      },
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
      () => {
        throw new Error('readDiff should not be called')
      },
      () => {
        throw new Error('requestSummary should not be called')
      },
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
      () => {
        throw new Error('readDiff should not be called')
      },
      () => {
        throw new Error('requestSummary should not be called')
      },
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
      () => {
        throw new Error('readDiff should not be called')
      },
      () => {
        throw new Error('requestSummary should not be called')
      },
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

  it('when an unsupported option is passed, logs usage error without invoking command dependencies', async () => {
    const errors: string[] = []
    const logger = {
      error: (message: unknown) => errors.push(String(message)),
    } as unknown as Logger

    await run(
      ['--unknown'],
      logger,
      () => {
        throw new Error('readDiff should not be called')
      },
      () => {
        throw new Error('requestSummary should not be called')
      },
      () => {
        throw new Error('consoleLog should not be called')
      },
      () => {
        throw new Error('commit should not be called')
      },
      () => {
        throw new Error('buildCatalog should not be called')
      },
    )

    expect(errors[0]).toContain('Usage: crow')
    expect(errors[0]).toContain('find-models')
    expect(errors[0]).toContain('git-commit')
  })
})

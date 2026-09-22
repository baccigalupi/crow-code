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
    const write = (summary: string) => summaries.push(summary)

    await run(
      ['git-commit', 'ship', 'the', 'command'],
      logger,
      getDiff,
      requestSummary,
      write,
    )

    expect(requests).toEqual([['current diff', 'ship the command']])
    expect(summaries).toEqual(['Add git commit summaries'])
    expect(errors).toEqual([])
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
})

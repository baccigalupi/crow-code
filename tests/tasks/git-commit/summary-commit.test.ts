import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import type { DenoCommand, Logger } from '../../../src/types.ts'
import { Environment } from '../../../src/env-vars.ts'
import { mockFetchError, mockFetchSuccess } from '../../support/mock-fetch.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { createTestDatabase } from '../../support/test-database.ts'
import { testModelRow, testProviderRow } from '../../support/model-rows.ts'
import { commitWithSummary } from '../../../src/tasks/git-commit/summary-commit.ts'

describe('commitWithSummary', () => {
  it('when a summary is generated, logs it and commits with it', async () => {
    const errors: string[] = []
    const logger = {
      info: () => {},
      error: (message: string) => errors.push(message),
    } as unknown as Logger
    const database = await createTestDatabase(logger)
    await database('providers').insert(testProviderRow())
    await database('models').insert(testModelRow({}))
    const summaries: string[] = []
    const commands: string[][] = []
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: 'Add commit summaries' } }],
    })
    const mockDenoCommand = class {
      constructor(_command: string, options: Deno.CommandOptions) {
        commands.push(options.args as string[])
      }
      output() {
        return Promise.resolve({ success: true, stdout: new Uint8Array() })
      }
    } as unknown as DenoCommand

    await commitWithSummary(
      'ship command',
      mockApplicationData({
        database,
        logger,
        consoleLog: (summary: string) => summaries.push(summary),
        fetchClient: fetchMock,
        denoCommand: mockDenoCommand,
        environment: new Environment({ NOUS_TEST_KEY: 'secret-key' }),
      }),
    )

    expect(summaries).toEqual(['Add commit summaries'])
    expect(commands[1]).toEqual(['commit', '-m', 'Add commit summaries'])
    await database.destroy()
  })

  it('when the summary is empty, logs a message and does not commit', async () => {
    const errors: string[] = []
    const logger = {
      info: () => {},
      error: (message: string) => errors.push(message),
    } as unknown as Logger
    const database = await createTestDatabase(logger)
    const summaries: string[] = []
    const commands: string[][] = []
    const mockDenoCommand = class {
      constructor(_command: string, options: Deno.CommandOptions) {
        commands.push(options.args as string[])
      }
      output() {
        return Promise.resolve({ success: true, stdout: new Uint8Array() })
      }
    } as unknown as DenoCommand

    await commitWithSummary(
      'ship command',
      mockApplicationData({
        database,
        logger,
        consoleLog: (summary: string) => summaries.push(summary),
        fetchClient: mockFetchError(500),
        denoCommand: mockDenoCommand,
        environment: new Environment({}),
      }),
    )

    expect(summaries).toEqual(['No summary generated; nothing committed'])
    expect(errors).toEqual([
      'No usable model endpoint; skipping commit summary',
      'No summary generated; nothing committed',
    ])
    expect(commands).toEqual([['diff', 'HEAD']])
    await database.destroy()
  })
})

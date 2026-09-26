import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import knex from 'knex'
import type { DenoCommand, Logger } from '../../../src/types.ts'
import { Environment } from '../../../src/env-vars.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import { mockFetchError, mockFetchSuccess } from '../../support/mock-fetch.ts'
import { commitWithSummary } from '../../../src/tasks/git-commit/summary-commit.ts'

const crowDirectory = join(fixturesDirectory, 'summary-commit', '.crow')

describe('commitWithSummary', () => {
  beforeEach(() => clearDirectory(crowDirectory))
  afterEach(() => clearDirectory(crowDirectory))

  it('when a summary is generated, logs it and commits with it', async () => {
    Deno.mkdirSync(crowDirectory, { recursive: true })
    Deno.writeTextFileSync(
      join(crowDirectory, 'models.json'),
      JSON.stringify({
        fetchedAt: '',
        modelCount: 1,
        models: [{
          id: 'first-model',
          name: 'First Model',
          provider: 'nous',
          reasoning: false,
          reasoningOptions: [],
          costInput: 0,
          costOutput: 0,
          contextLength: 1000,
          modality: 'text->text',
          knowledgeCutoff: null,
          size: '',
        }],
      }),
    )
    Deno.writeTextFileSync(
      join(crowDirectory, 'providers.json'),
      JSON.stringify({
        providers: [{
          name: 'nous',
          baseUrl: 'https://nous.example',
          apiKeyEnv: 'NOUS_TEST_KEY',
        }],
      }),
    )
    const logger = { error: () => {} } as unknown as Logger
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

    await commitWithSummary('ship command', {
      parsedArguments: { commands: ['git-commit'], options: {} },
      crowDirectory,
      logger,
      database: knex({
        client: 'better-sqlite3',
        connection: ':memory:',
        useNullAsDefault: true,
      }),
      consoleLog: (summary: string) => summaries.push(summary),
      fetchClient: fetchMock,
      denoCommand: mockDenoCommand,
      environment: new Environment({ NOUS_TEST_KEY: 'secret-key' }),
    })

    expect(summaries).toEqual(['Add commit summaries'])
    expect(commands[1]).toEqual(['commit', '-m', 'Add commit summaries'])
  })

  it('when the summary is empty, logs a message and does not commit', async () => {
    const errors: string[] = []
    const logger = {
      error: (message: string) => errors.push(message),
    } as unknown as Logger
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

    await commitWithSummary('ship command', {
      parsedArguments: { commands: ['git-commit'], options: {} },
      crowDirectory,
      logger,
      database: knex({
        client: 'better-sqlite3',
        connection: ':memory:',
        useNullAsDefault: true,
      }),
      consoleLog: (summary: string) => summaries.push(summary),
      fetchClient: mockFetchError(500),
      denoCommand: mockDenoCommand,
      environment: new Environment({}),
    })

    expect(summaries).toEqual(['No summary generated; nothing committed'])
    expect(errors).toEqual([
      'No usable model endpoint; skipping commit summary',
      'No summary generated; nothing committed',
    ])
    expect(commands).toEqual([['diff', 'HEAD']])
  })
})

import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import type { DenoCommand, Logger } from '../../../src/types.ts'
import { Environment } from '../../../src/env-vars.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import { mockFetchError, mockFetchSuccess } from '../../support/mock-fetch.ts'
import {
  GitCommit,
  GitCommitMatch,
} from '../../../src/cli/commands/git-commit.ts'

const crowDirectory = join(fixturesDirectory, 'git-commit', '.crow')

describe('git-commit', () => {
  beforeEach(() => clearDirectory(crowDirectory))
  afterEach(() => clearDirectory(crowDirectory))

  it('when a summary is generated, logs it', async () => {
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
          baseUrl: 'https://nous.example/v1',
          apiKeyEnv: 'NOUS_TEST_KEY',
        }],
      }),
    )
    const logger = { error: () => {} } as unknown as Logger
    const summaries: string[] = []
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: 'Add commit summaries' } }],
    })
    const mockDenoCommand = class {
      output() {
        return Promise.resolve({ success: true, stdout: new Uint8Array() })
      }
    } as unknown as DenoCommand

    await new GitCommit(
      {
        crowDirectory,
        logger,
        consoleLog: (summary: string) => summaries.push(summary),
        fetchClient: fetchMock,
        denoCommand: mockDenoCommand,
        environment: new Environment({ NOUS_TEST_KEY: 'secret-key' }),
      },
      { goal: 'ship command' },
    ).run()

    expect(summaries).toEqual(['Add commit summaries'])
  })

  it('when the summary is empty, logs an empty string', async () => {
    const logger = { error: () => {} } as unknown as Logger
    const summaries: string[] = []
    const fetchMock = mockFetchError(500)
    const mockDenoCommand = class {
      output() {
        return Promise.resolve({ success: true, stdout: new Uint8Array() })
      }
    } as unknown as DenoCommand

    await new GitCommit(
      {
        crowDirectory,
        logger,
        consoleLog: (summary: string) => summaries.push(summary),
        fetchClient: fetchMock,
        denoCommand: mockDenoCommand,
        environment: new Environment({}),
      },
      { goal: 'ship command' },
    ).run()

    expect(summaries).toEqual([''])
  })

  describe('GitCommitMatch', () => {
    it('when the command is git-commit, returns true', () => {
      const match = new GitCommitMatch({
        commands: ['git-commit'],
        options: {},
      })

      expect(match.isMatch()).toBe(true)
    })

    it('when the command is something else, returns false', () => {
      const match = new GitCommitMatch({
        commands: ['create-model-catalog'],
        options: {},
      })

      expect(match.isMatch()).toBe(false)
    })

    it('when a goal option is passed, extracts it', () => {
      const match = new GitCommitMatch({
        commands: ['git-commit'],
        options: { goal: 'ship it' },
      })

      expect(match.extractOptions()).toEqual({ goal: 'ship it' })
    })
  })
})

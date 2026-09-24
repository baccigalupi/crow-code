import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import type { Logger } from '../../../src/types.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import { mockFetchError, mockFetchSuccess } from '../../support/mock-fetch.ts'
import {
  GitCommit,
  GitCommitMatch,
} from '../../../src/cli/commands/git-commit.ts'

const crowDirectory = join(fixturesDirectory, 'git-commit', '.crow')

class FakeCommand {
  command: string
  options: Deno.CommandOptions

  constructor(command: string, options: Deno.CommandOptions) {
    this.command = command
    this.options = options
  }

  output() {
    if (this.options.args?.[0] === 'diff') {
      return Promise.resolve({
        success: true,
        code: 0,
        signal: null,
        stdout: new TextEncoder().encode('fake diff'),
        stderr: new Uint8Array(),
      })
    }
    return Promise.resolve({
      success: true,
      code: 0,
      signal: null,
      stdout: new Uint8Array(),
      stderr: new Uint8Array(),
    })
  }
}

const model = {
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
}

const provider = {
  name: 'nous',
  baseUrl: 'https://nous.example/v1',
  apiKeyEnv: 'NOUS_TEST_KEY',
}

const setupCrowDirectory = () => {
  Deno.mkdirSync(crowDirectory, { recursive: true })
  Deno.writeTextFileSync(
    join(crowDirectory, 'models.json'),
    JSON.stringify({ fetchedAt: '', modelCount: 1, models: [model] }),
  )
  Deno.writeTextFileSync(
    join(crowDirectory, 'providers.json'),
    JSON.stringify({ providers: [provider] }),
  )
}

describe('GitCommit', () => {
  let originalCommand: typeof Deno.Command

  beforeEach(async () => {
    originalCommand = Deno.Command
    Deno.Command = FakeCommand as never
    await clearDirectory(crowDirectory)
  })

  afterEach(async () => {
    Deno.Command = originalCommand
    await clearDirectory(crowDirectory)
  })

  it('when a summary is generated, logs it and commits with it', async () => {
    setupCrowDirectory()
    Deno.env.set('NOUS_TEST_KEY', 'secret-key')
    const logger = { error: () => {} } as unknown as Logger
    const summaries: string[] = []
    const consoleLog = (summary: string) => summaries.push(summary)
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: 'Add commit summaries' } }],
    })

    await new GitCommit(
      {
        crowDirectory,
        logger,
        consoleLog,
        fetchClient: fetchMock,
      },
      'ship command',
    ).run()

    const request = fetchMock.calls[0] as Request
    const body = await request.json()
    expect(summaries).toEqual(['Add commit summaries'])
    expect(body.messages[1].content).toContain('ship command')
    Deno.env.delete('NOUS_TEST_KEY')
  })

  it('when the summary is empty, logs it and does not commit', async () => {
    setupCrowDirectory()
    Deno.env.set('NOUS_TEST_KEY', 'secret-key')
    const logger = { error: () => {} } as unknown as Logger
    const summaries: string[] = []
    const consoleLog = (summary: string) => summaries.push(summary)
    const fetchMock = mockFetchError(500)

    await new GitCommit(
      {
        crowDirectory,
        logger,
        consoleLog,
        fetchClient: fetchMock,
      },
      'ship command',
    ).run()

    expect(summaries).toEqual([''])
    Deno.env.delete('NOUS_TEST_KEY')
  })
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

  it('extracts the goal option', () => {
    const match = new GitCommitMatch({
      commands: ['git-commit'],
      options: { goal: 'ship it' },
    })

    expect(match.extractOptions()).toEqual({ goal: 'ship it' })
  })
})

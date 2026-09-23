import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import type { Logger } from '../../../src/types.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import { mockFetchError, mockFetchSuccess } from '../../support/mock-fetch.ts'
import { GitCommit } from '../../../src/cli/commands/git-commit.ts'

const crowDirectory = join(fixturesDirectory, 'git-commit', '.crow')

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
  beforeEach(() => clearDirectory(crowDirectory))
  afterEach(() => clearDirectory(crowDirectory))

  it('when a summary is generated, logs it and commits with it', async () => {
    setupCrowDirectory()
    Deno.env.set('NOUS_TEST_KEY', 'secret-key')
    const logger = { error: () => {} } as unknown as Logger
    const summaries: string[] = []
    const consoleLog = (summary: string) => summaries.push(summary)
    const commits: string[] = []
    const commit = (summary: string) => {
      commits.push(summary)
      return Promise.resolve(true)
    }
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: 'Add commit summaries' } }],
    })

    await new GitCommit(
      'ship command',
      crowDirectory,
      logger,
      consoleLog,
      commit,
      fetchMock,
    ).run()

    const request = fetchMock.calls[0] as Request
    const body = await request.json()
    expect(summaries).toEqual(['Add commit summaries'])
    expect(commits).toEqual(['Add commit summaries'])
    expect(body.messages[1].content).toContain('ship command')
    Deno.env.delete('NOUS_TEST_KEY')
  })

  it('when the summary is empty, logs it and does not commit', async () => {
    setupCrowDirectory()
    Deno.env.set('NOUS_TEST_KEY', 'secret-key')
    const logger = { error: () => {} } as unknown as Logger
    const summaries: string[] = []
    const consoleLog = (summary: string) => summaries.push(summary)
    const commits: string[] = []
    const commit = (summary: string) => {
      commits.push(summary)
      return Promise.resolve(true)
    }
    const fetchMock = mockFetchError(500)

    await new GitCommit(
      'ship command',
      crowDirectory,
      logger,
      consoleLog,
      commit,
      fetchMock,
    ).run()

    expect(summaries).toEqual([''])
    expect(commits).toEqual([])
    Deno.env.delete('NOUS_TEST_KEY')
  })
})

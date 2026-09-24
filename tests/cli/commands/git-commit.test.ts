import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import type { DenoCommand, Logger } from '../../../src/types.ts'
import { Environment } from '../../../src/env-vars.ts'
import { mockFetchError } from '../../support/mock-fetch.ts'
import {
  GitCommit,
  GitCommitMatch,
} from '../../../src/cli/commands/git-commit.ts'

describe('git-commit', () => {
  it('when run, logs the generated summary', async () => {
    const logger = { error: () => {} } as unknown as Logger
    const summaries: string[] = []
    const mockDenoCommand = class {
      output() {
        return Promise.resolve({ success: true, stdout: new Uint8Array() })
      }
    } as unknown as DenoCommand

    await new GitCommit(
      {
        crowDirectory: Deno.makeTempDirSync(),
        logger,
        consoleLog: (summary: string) => summaries.push(summary),
        fetchClient: mockFetchError(500),
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

    it('when no goal option is passed, extracts an empty goal', () => {
      const match = new GitCommitMatch({
        commands: ['git-commit'],
        options: {},
      })

      expect(match.extractOptions()).toEqual({ goal: '' })
    })
  })
})

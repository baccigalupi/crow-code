import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import type { DenoCommand } from '../../../src/types.ts'
import { Environment } from '../../../src/env-vars.ts'
import { mockFetchError } from '../../support/mock-fetch.ts'
import { GitCommit } from '../../../src/cli/commands/git-commit.ts'

describe('GitCommit', () => {
  it('when the command is git-commit, matches', () => {
    const command = new GitCommit({
      parsedArguments: { commands: ['git-commit'], options: {} },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(command.isMatch()).toBe(true)
  })

  it('when the command is something else, does not match', () => {
    const command = new GitCommit({
      parsedArguments: { commands: ['create-model-catalog'], options: {} },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(command.isMatch()).toBe(false)
  })

  it('when a goal option is passed, extracts it', () => {
    const command = new GitCommit({
      parsedArguments: {
        commands: ['git-commit'],
        options: { goal: 'ship it' },
      },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(command.extractOptions()).toEqual({ goal: 'ship it' })
  })

  it('when no goal option is passed, extracts an empty goal', () => {
    const command = new GitCommit({
      parsedArguments: { commands: ['git-commit'], options: {} },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(command.extractOptions()).toEqual({ goal: '' })
  })

  it('when run, logs the generated summary', async () => {
    const summaries: string[] = []
    const mockDenoCommand = class {
      output() {
        return Promise.resolve({ success: true, stdout: new Uint8Array() })
      }
    } as unknown as DenoCommand

    await new GitCommit({
      parsedArguments: {
        commands: ['git-commit'],
        options: { goal: 'ship command' },
      },
      crowDirectory: Deno.makeTempDirSync(),
      logger: pino({ enabled: false }),
      consoleLog: (summary: string) => summaries.push(summary),
      fetchClient: mockFetchError(500),
      denoCommand: mockDenoCommand,
      environment: new Environment({}),
    }).run()

    expect(summaries).toEqual([''])
  })
})

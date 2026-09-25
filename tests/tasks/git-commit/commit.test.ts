import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import type { DenoCommand, Logger } from '../../../src/types.ts'
import { commitChanges } from '../../../src/tasks/git-commit/commit.ts'

describe('commitChanges', () => {
  it('when called, runs git commit with the message', async () => {
    let executable = ''
    let commandOptions: Deno.CommandOptions = {}

    class FakeCommand {
      constructor(command: string, options: Deno.CommandOptions) {
        executable = command
        commandOptions = options
      }

      output() {
        return Promise.resolve({
          success: true,
          code: 0,
          signal: null,
          stdout: new Uint8Array(),
          stderr: new Uint8Array(),
        })
      }
    }

    await commitChanges(
      'Add commit support',
      { error: () => {} } as unknown as Logger,
      FakeCommand as unknown as DenoCommand,
    )

    expect(executable).toBe('git')
    expect(commandOptions.args).toEqual(['commit', '-m', 'Add commit support'])
  })

  it('when git succeeds, returns true', async () => {
    class FakeCommand {
      output() {
        return Promise.resolve({
          success: true,
          code: 0,
          signal: null,
          stdout: new Uint8Array(),
          stderr: new Uint8Array(),
        })
      }
    }

    const success = await commitChanges(
      'Add commit support',
      { error: () => {} } as unknown as Logger,
      FakeCommand as unknown as DenoCommand,
    )

    expect(success).toBe(true)
  })

  it('when git exits non-zero, logs stderr and returns false', async () => {
    const errors: string[] = []
    const logger = {
      error: (message: unknown) => errors.push(String(message)),
    } as unknown as Logger

    class FakeCommand {
      output() {
        return Promise.resolve({
          success: false,
          code: 1,
          signal: null,
          stdout: new Uint8Array(),
          stderr: new TextEncoder().encode('nothing to commit'),
        })
      }
    }

    const success = await commitChanges(
      'Add commit support',
      logger,
      FakeCommand as unknown as DenoCommand,
    )

    expect(success).toBe(false)
    expect(errors).toEqual(['Git error: nothing to commit'])
  })

  it('when command throws, logs the error and returns false', async () => {
    const errors: string[] = []
    const logger = {
      error: (message: unknown) => errors.push(String(message)),
    } as unknown as Logger

    class FakeCommand {
      constructor() {
        throw new Error('git not found')
      }
    }

    const success = await commitChanges(
      'Add commit support',
      logger,
      FakeCommand as unknown as DenoCommand,
    )

    expect(success).toBe(false)
    expect(errors).toEqual(['Git error: git not found'])
  })
})

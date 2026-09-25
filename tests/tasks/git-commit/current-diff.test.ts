import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import type { DenoCommand, Logger } from '../../../src/types.ts'
import { getCurrentDiff } from '../../../src/tasks/git-commit/current-diff.ts'

class FakeLogger {
  errorMessage = ''

  error(message: string) {
    this.errorMessage = message
  }
}

describe('getCurrentDiff', () => {
  it('when requested, runs git diff against HEAD', async () => {
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
          stdout: new TextEncoder().encode('diff output'),
          stderr: new Uint8Array(),
        })
      }
    }

    await getCurrentDiff(
      new FakeLogger() as unknown as Logger,
      FakeCommand as unknown as DenoCommand,
    )

    expect(executable).toBe('git')
    expect(commandOptions.args).toEqual(['diff', 'HEAD'])
  })

  it('when git writes a diff, decodes the output', async () => {
    class FakeCommand {
      output() {
        return Promise.resolve({
          success: true,
          code: 0,
          signal: null,
          stdout: new TextEncoder().encode('diff --git a/file b/file'),
          stderr: new Uint8Array(),
        })
      }
    }

    const diff = await getCurrentDiff(
      new FakeLogger() as unknown as Logger,
      FakeCommand as unknown as DenoCommand,
    )

    expect(diff).toBe('diff --git a/file b/file')
  })

  it('when git fails, logs stderr and returns an empty diff', async () => {
    const logger = new FakeLogger()

    class FakeCommand {
      output() {
        return Promise.resolve({
          success: false,
          code: 128,
          signal: null,
          stdout: new Uint8Array(),
          stderr: new TextEncoder().encode('fatal'),
        })
      }
    }

    const diff = await getCurrentDiff(
      logger as unknown as Logger,
      FakeCommand as unknown as DenoCommand,
    )

    expect(diff).toBe('')
    expect(logger.errorMessage).toBe('Git error: fatal')
  })

  it('when command throws, logs the error', async () => {
    const logger = new FakeLogger()

    class FakeCommand {
      output() {
        return Promise.reject(new Error('git not found'))
      }
    }

    const diff = await getCurrentDiff(
      logger as unknown as Logger,
      FakeCommand as unknown as DenoCommand,
    )

    expect(diff).toBe('')
    expect(logger.errorMessage).toBe('Git error: git not found')
  })
})

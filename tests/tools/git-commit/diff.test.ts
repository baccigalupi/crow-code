import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { getCurrentDiff } from '../../../src/tools/git-commit/diff.ts'

describe('getCurrentDiff', () => {
  it('when requested, runs git diff against HEAD', async () => {
    let executable = ''
    let commandOptions: Deno.CommandOptions = {}
    const execute = (command: string, options: Deno.CommandOptions) => {
      executable = command
      commandOptions = options
      return Promise.resolve({
        success: true,
        code: 0,
        signal: null,
        stdout: new TextEncoder().encode('diff output'),
        stderr: new Uint8Array(),
      })
    }

    await getCurrentDiff(execute)

    expect(executable).toBe('git')
    expect(commandOptions.args).toEqual(['diff', 'HEAD'])
  })

  it('when git writes a diff, decodes the output', async () => {
    const execute = () =>
      Promise.resolve({
        success: true,
        code: 0,
        signal: null,
        stdout: new TextEncoder().encode('diff --git a/file b/file'),
        stderr: new Uint8Array(),
      })

    const diff = await getCurrentDiff(execute)

    expect(diff).toBe('diff --git a/file b/file')
  })

  it('when git fails, returns an empty diff', async () => {
    const execute = () =>
      Promise.resolve({
        success: false,
        code: 128,
        signal: null,
        stdout: new Uint8Array(),
        stderr: new TextEncoder().encode('fatal'),
      })

    const diff = await getCurrentDiff(execute)

    expect(diff).toBe('')
  })
})

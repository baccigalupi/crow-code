import { returnsNext } from '@std/testing/mock'
import type { Command, CommandOptions } from '../../src/types.ts'

type CommandSpy = (
  command: string,
  options: CommandOptions,
) => void

type MockCommandOptions = {
  stdout?: string | (string | Error)[]
  stderr?: string
  success?: boolean
  code?: number
  outputError?: string
  commandSpy?: CommandSpy
}

const stdoutSequence = (stdout: string | (string | Error)[]) => {
  if (typeof stdout === 'string') return () => stdout

  return returnsNext(stdout)
}

export const mockCommand = (
  {
    stdout = '',
    stderr = '',
    success = true,
    code = 0,
    outputError,
    commandSpy,
  }: MockCommandOptions = {},
): Command => {
  const nextStdout = stdoutSequence(stdout)

  return async (executable, options) => {
    if (commandSpy) commandSpy(executable, options)
    if (outputError !== undefined) {
      throw new Error(outputError)
    }

    return await Promise.resolve().then(() => ({
      success,
      code,
      stdout: nextStdout(),
      stderr,
    }))
  }
}

const mockDenoCommand = (options: MockCommandOptions = {}) => {
  const command = mockCommand(options)

  return class MockDenoCommand {
    private executable: string
    private options: CommandOptions

    constructor(executable: string, options: CommandOptions) {
      this.executable = executable
      this.options = options
    }

    async output() {
      const output = await command(this.executable, this.options)
      return {
        success: output.success,
        code: output.code,
        signal: null,
        stdout: new TextEncoder().encode(output.stdout),
        stderr: new TextEncoder().encode(output.stderr),
      }
    }
  } as unknown as typeof Deno.Command
}

export const mockDeno = (
  { args = [], ...command }: { args?: string[] } & MockCommandOptions = {},
) =>
  ({
    ...Deno,
    args,
    Command: mockDenoCommand(command),
  }) as unknown as typeof Deno

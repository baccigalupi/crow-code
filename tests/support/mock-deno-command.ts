import { returnsNext } from '@std/testing/mock'

type CommandSpy = (
  command: string,
  options: Deno.CommandOptions,
) => void

type MockDenoCommandOptions = {
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

export const mockDenoCommand = (
  {
    stdout = '',
    stderr = '',
    success = true,
    code = 0,
    outputError,
    commandSpy,
  }: MockDenoCommandOptions = {},
) => {
  const nextStdout = stdoutSequence(stdout)

  return class MockCommand {
    constructor(command: string, options: Deno.CommandOptions) {
      if (commandSpy) commandSpy(command, options)
    }

    async output() {
      if (outputError !== undefined) {
        throw new Error(outputError)
      }

      return await Promise.resolve().then(() => this.response())
    }

    private response() {
      return {
        success,
        code,
        signal: null,
        stdout: new TextEncoder().encode(nextStdout()),
        stderr: new TextEncoder().encode(stderr),
      }
    }
  } as unknown as typeof Deno.Command
}

export const mockDeno = (
  { args = [], stdout = '' }: { args?: string[]; stdout?: string } = {},
) =>
  ({
    args,
    Command: mockDenoCommand({ stdout }),
    realPath: Deno.realPath,
  }) as unknown as typeof Deno

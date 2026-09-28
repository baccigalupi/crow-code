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

    output() {
      if (outputError !== undefined) {
        return Promise.reject(new Error(outputError))
      }

      return Promise.resolve().then(() => this.response())
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

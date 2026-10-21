import { spyOn } from 'bun:test'
import { Runtime } from '../../src/application-data/runtime.ts'
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

  const queue = [...stdout]
  return () => {
    const next = queue.shift()
    if (next instanceof Error) throw next
    return next as string
  }
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

export const mockRuntime = (
  { args = [], ...command }: { args?: string[] } & MockCommandOptions = {},
) => {
  const runtime = new Runtime(process)
  spyOn(runtime, 'args').mockReturnValue(args)
  spyOn(runtime, 'runCommand').mockImplementation(mockCommand(command))
  return runtime
}

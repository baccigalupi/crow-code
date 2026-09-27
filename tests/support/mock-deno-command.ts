type CommandSpy = (
  command: string,
  options: Deno.CommandOptions,
) => void

type MockDenoCommandOptions = {
  stdout?: string
  stderr?: string
  success?: boolean
  code?: number
  outputError?: string
  commandSpy?: CommandSpy
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
  return class MockCommand {
    constructor(command: string, options: Deno.CommandOptions) {
      if (commandSpy) commandSpy(command, options)
    }

    output() {
      if (outputError !== undefined) {
        return Promise.reject(new Error(outputError))
      }

      return Promise.resolve({
        success,
        code,
        signal: null,
        stdout: new TextEncoder().encode(stdout),
        stderr: new TextEncoder().encode(stderr),
      })
    }
  } as unknown as typeof Deno.Command
}

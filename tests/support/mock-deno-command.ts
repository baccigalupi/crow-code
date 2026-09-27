type MockDenoCommandOptions = {
  stdout?: string
  stderr?: string
  success?: boolean
  code?: number
  outputError?: string
}

export const mockDenoCommand = (
  { stdout = '', stderr = '', success = true, code = 0, outputError }:
    MockDenoCommandOptions = {},
) => {
  return class MockCommand {
    constructor(_command: string, _options: Deno.CommandOptions) {}

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

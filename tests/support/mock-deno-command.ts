type MockDenoCommandOptions = {
  stdout?: string
  stderr?: string
  success?: boolean
  code?: number
}

export const mockDenoCommand = (
  { stdout = '', stderr = '', success = true, code = 0 }:
    MockDenoCommandOptions = {},
) => {
  return class MockCommand {
    constructor(_command: string, _options: Deno.CommandOptions) {}

    output() {
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

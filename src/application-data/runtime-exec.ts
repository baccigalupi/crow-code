import type { CommandOptions, CommandOutput } from '../types.ts'

const decode = (bytes: Uint8Array) => new TextDecoder().decode(bytes)

export const runtimeExec = async (
  deno: typeof Deno,
  executable: string,
  options: CommandOptions,
): Promise<CommandOutput> => {
  const output = await new deno.Command(executable, options).output()
  return {
    success: output.success,
    code: output.code,
    stdout: decode(output.stdout),
    stderr: decode(output.stderr),
  }
}

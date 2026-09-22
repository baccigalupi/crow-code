type CommandExecutor = (
  command: string,
  options: Deno.CommandOptions,
) => Promise<Deno.CommandOutput>

const executeCommand: CommandExecutor = (command, options) => {
  return new Deno.Command(command, options).output()
}

const decodeOutput = (output: Deno.CommandOutput) => {
  if (!output.success) return ''
  return new TextDecoder().decode(output.stdout)
}

export const getCurrentDiff = async (
  execute: CommandExecutor = executeCommand,
): Promise<string> => {
  try {
    const output = await execute('git', { args: ['diff', 'HEAD'] })
    return decodeOutput(output)
  } catch {
    return ''
  }
}

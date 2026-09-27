import type { DenoCommand } from '../types.ts'

type ExecCommandArguments = {
  denoCommand?: DenoCommand
  commandComponents: string[]
}

export class ExecCommand {
  denoCommand: DenoCommand
  commandComponents: string[]

  constructor(
    { denoCommand = Deno.Command, commandComponents }: ExecCommandArguments,
  ) {
    this.denoCommand = denoCommand
    this.commandComponents = commandComponents
  }
}

export const execCommand = (
  { denoCommand = Deno.Command, commandComponents }: ExecCommandArguments,
) => {
  return new ExecCommand({ denoCommand, commandComponents })
}

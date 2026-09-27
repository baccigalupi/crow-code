import type { DenoCommand } from '../../types.ts'

type GitDiffArguments = {
  denoCommand?: DenoCommand
  filter?: string[] | null
}

export class GitDiff {
  denoCommand: DenoCommand
  filter: string[] | null

  constructor(
    { denoCommand = Deno.Command, filter = null }: GitDiffArguments = {},
  ) {
    this.denoCommand = denoCommand
    this.filter = filter
  }
}

export const gitDiff = (
  { denoCommand = Deno.Command, filter = null }: GitDiffArguments = {},
) => {
  return new GitDiff({ denoCommand, filter })
}

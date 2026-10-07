export type ParsedArgumentsOptions = Record<string, string | boolean>

export type ParsedArguments = {
  commands: string[]
  options: ParsedArgumentsOptions
}

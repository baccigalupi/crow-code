import type { ApplicationData } from '../application-data/application-data.ts'
import type { ReplIo, ReplStatus } from '../tui/types.ts'

export type ParsedArgumentsOptions = Record<string, string | boolean>

export type ParsedArguments = {
  commands: string[]
  options: ParsedArgumentsOptions
}

export type TuiRunner = { status(): Promise<ReplStatus> }

export type RunTui = (applicationData: ApplicationData, io: ReplIo) => TuiRunner

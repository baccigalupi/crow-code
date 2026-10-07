import type { ApplicationData } from '../../application-data.ts'
import type { ParsedArgumentsOptions } from '../types.ts'

export abstract class Command {
  protected applicationData: ApplicationData
  protected commands: string[]
  protected options: ParsedArgumentsOptions

  constructor(applicationData: ApplicationData) {
    this.applicationData = applicationData
    this.commands = applicationData.parsedArguments().commands
    this.options = applicationData.parsedArguments().options
  }

  abstract isMatch(): boolean
  abstract run(): Promise<void>
}

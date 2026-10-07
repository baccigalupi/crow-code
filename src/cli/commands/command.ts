import type { ApplicationData } from '../../application-data.ts'
import { Operation } from '../../operation.ts'
import type { ApplicationOperationArguments } from '../../types.ts'
import type { ParsedArguments } from '../types.ts'

export abstract class Command extends Operation<ParsedArguments> {
  protected logPrefix = 'Command: '

  protected get commands() {
    return this.operationArguments.commands
  }

  protected get options() {
    return this.operationArguments.options
  }

  abstract isMatch(): boolean
}

export const command = <T extends Command>(
  CommandClass: new (
    args: ApplicationOperationArguments<ParsedArguments>,
  ) => T,
  applicationData: ApplicationData,
): T =>
  new CommandClass({
    applicationData,
    operationArguments: applicationData.parsedArguments(),
  })

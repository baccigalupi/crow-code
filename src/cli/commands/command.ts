import { humanName, Operation } from '../../operation.ts'
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

  exitCode() {
    if (this.success()) return 0
    return 1
  }

  reportFailure() {
    this.applicationData.consoleError()(this.failureMessage())
  }

  private failureMessage() {
    return `Error: ${this.errorReason()} for ${this.commandText()}`
  }

  protected errorReason() {
    return this.reason
  }

  private commandText() {
    if (!this.commands[0]) return humanName(this.constructor.name)
    return this.commands[0]
  }
}

import type { ApplicationData } from './application-data.ts'
import type { ApplicationOperationArguments, Logger } from './types.ts'

export abstract class Operation<OperationArguments> {
  protected applicationData: ApplicationData
  protected operationArguments: OperationArguments
  protected succeeded = false
  protected logger: Logger
  protected reason = ''
  protected logPrefix = ''

  constructor(
    { applicationData, operationArguments }: ApplicationOperationArguments<
      OperationArguments
    >,
  ) {
    this.applicationData = applicationData
    this.operationArguments = operationArguments
    this.logger = applicationData.logger()
    this.unpackArguments()
  }

  protected unpackArguments() {}

  success() {
    return this.succeeded
  }

  abstract run(): Promise<this>

  protected fail(reason: string) {
    this.succeeded = false
    this.reason = reason
    this.logError(reason)
  }

  protected logError(message: string) {
    this.logger.error(`${this.logPrefix}: ${message}`)
  }
}

export abstract class OperationWithResult<OperationArguments, Result>
  extends Operation<OperationArguments> {
  abstract result(): Result
}

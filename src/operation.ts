import type { ApplicationData } from './application-data.ts'
import type { ApplicationOperationArguments } from './types.ts'

export abstract class Operation<OperationArguments> {
  protected applicationData: ApplicationData
  protected operationArguments: OperationArguments
  protected succeeded = false

  constructor(
    { applicationData, operationArguments }: ApplicationOperationArguments<
      OperationArguments
    >,
  ) {
    this.applicationData = applicationData
    this.operationArguments = operationArguments
    this.unpackArguments()
  }

  protected unpackArguments() {}

  success() {
    return this.succeeded
  }

  abstract run(): Promise<this>
}

export abstract class OperationWithResult<OperationArguments, Result>
  extends Operation<OperationArguments> {
  abstract result(): Result
}

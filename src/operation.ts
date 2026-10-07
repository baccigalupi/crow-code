import type { ApplicationData } from './application-data.ts'
import type { ApplicationTaskArguments } from './types.ts'

export abstract class Operation<TaskArguments> {
  protected applicationData: ApplicationData
  protected taskArguments: TaskArguments
  protected succeeded = false

  constructor(
    { applicationData, taskArguments }: ApplicationTaskArguments<TaskArguments>,
  ) {
    this.applicationData = applicationData
    this.taskArguments = taskArguments
    this.unpackArguments()
  }

  protected unpackArguments() {}

  success() {
    return this.succeeded
  }

  abstract run(): Promise<this>
}

export abstract class OperationWithResult<TaskArguments, Result>
  extends Operation<TaskArguments> {
  abstract result(): Result
}

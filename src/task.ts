import type { ApplicationData } from './application-data.ts'
import type { ApplicationTaskArguments } from './types.ts'

export abstract class Task<TaskArguments> {
  protected applicationData: ApplicationData
  protected taskArguments: TaskArguments
  protected succeeded = false

  constructor(
    { applicationData, taskArguments }: ApplicationTaskArguments<TaskArguments>,
  ) {
    this.applicationData = applicationData
    this.taskArguments = taskArguments
  }

  success() {
    return this.succeeded
  }

  abstract run(): Promise<this>
}

export abstract class TaskWithResult<TaskArguments, Result>
  extends Task<TaskArguments> {
  abstract result(): Result
}

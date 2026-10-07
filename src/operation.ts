import type { ApplicationData } from './application-data.ts'
import type {
  ApplicationOperationArguments,
  AsyncOperation,
  AsyncOperationWithResult,
  Logger,
} from './types.ts'

export abstract class Operation<OperationArguments> implements AsyncOperation {
  protected applicationData: ApplicationData
  protected operationArguments: OperationArguments
  protected succeeded = true
  protected logger: Logger
  protected reason = ''
  protected logPrefix = ''
  protected subOperations: AsyncOperation[]

  constructor(
    { applicationData, operationArguments }: ApplicationOperationArguments<
      OperationArguments
    >,
  ) {
    this.applicationData = applicationData
    this.operationArguments = operationArguments
    this.logger = applicationData.logger()
    this.subOperations = []
  }

  success() {
    return this.succeeded
  }

  abstract run(): Promise<AsyncOperation>

  protected async runSubOperation<T extends AsyncOperation>(
    operation: T,
  ) {
    if (!this.succeeded) return operation

    await operation.run()
    this.subOperations.push(operation)
    if (!operation.success()) {
      this.fail(`Error running suboperation: ${operation}`)
    }
    return operation
  }

  protected fail(reason: string) {
    this.succeeded = false
    this.reason = reason
    this.logError(reason)
  }

  protected logError(message: string) {
    this.logger.error(`${this.logPrefix}${message}`)
  }
}

export abstract class OperationWithResult<OperationArguments, Result>
  extends Operation<OperationArguments>
  implements AsyncOperationWithResult<Result> {
  abstract result(): Result
}

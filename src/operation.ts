import type { ApplicationData } from './application-data/application-data.ts'
import type {
  ApplicationOperationArguments,
  AsyncOperation,
  AsyncOperationWithResult,
  Logger,
} from './types.ts'

export const humanName = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase()

const failedOperationReason = (operation: AsyncOperation) =>
  operation.reason || `${humanName(operation.constructor.name)} failed`

export abstract class Operation<OperationArguments> implements AsyncOperation {
  protected applicationData: ApplicationData
  protected operationArguments: OperationArguments
  protected succeeded = true
  reason = ''
  protected abstract logPrefix: string
  protected subOperations: AsyncOperation[]

  constructor({
    applicationData,
    operationArguments,
  }: ApplicationOperationArguments<OperationArguments>) {
    this.applicationData = applicationData
    this.operationArguments = operationArguments
    this.subOperations = []
  }

  protected get logger(): Logger {
    return this.applicationData.logger()
  }

  success() {
    return this.succeeded
  }

  abstract run(): Promise<AsyncOperation>

  protected subResults<Result>() {
    return this.subOperations.map((operation) =>
      (operation as AsyncOperationWithResult<Result>).result(),
    )
  }

  protected async runSubOperation<T extends AsyncOperation>(operation: T) {
    if (!this.succeeded) return operation

    await this.runNonBlockingOperation(operation)
    if (!operation.success()) this.fail(failedOperationReason(operation))
    return operation
  }

  protected async runNonBlockingOperation<T extends AsyncOperation>(
    operation: T,
  ) {
    await operation.run()
    this.subOperations.push(operation)
    return operation
  }

  protected failFromSubOperations() {
    const failed = this.subOperations.find((operation) => !operation.success())
    if (failed) this.fail(failedOperationReason(failed))
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
  implements AsyncOperationWithResult<Result>
{
  abstract result(): Result
}

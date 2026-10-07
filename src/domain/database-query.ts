import type { ApplicationOperationArguments } from '../types.ts'
import type {
  DatabaseQueryArguments,
  DatabaseQuerySerializer,
} from './types.ts'
import { OperationWithResult } from '../operation.ts'

const defaultSerializer = <T>(value: T): T => value // passes values through unchanged

export class DatabaseQuery<Result, Serialized = Result[]>
  extends OperationWithResult<
    DatabaseQueryArguments<Result, Serialized>,
    Serialized
  > {
  protected override logPrefix = 'Database query: '
  private queryResult: Result[] = []

  async run() {
    try {
      this.queryResult = await this.operationArguments.query
    } catch (error) {
      this.fail((error as Error).message)
    }
    return this
  }

  result() {
    return this.serializer()(this.queryResult)
  }

  private serializer() {
    if (this.operationArguments.resultSerializer) {
      return this.operationArguments.resultSerializer
    }
    return defaultSerializer as DatabaseQuerySerializer<Result[], Serialized>
  }
}

export const databaseQuery = <Result, Serialized = Result[]>(
  args: ApplicationOperationArguments<
    DatabaseQueryArguments<Result, Serialized>
  >,
) => new DatabaseQuery<Result, Serialized>(args)

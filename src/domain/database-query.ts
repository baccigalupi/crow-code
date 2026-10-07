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
  private queryResult: Result[] = []
  declare private resultSerializer: DatabaseQuerySerializer<
    Result[],
    Serialized
  >

  protected override unpackArguments() {
    this.resultSerializer = defaultSerializer as DatabaseQuerySerializer<
      Result[],
      Serialized
    >
    if (this.operationArguments.resultSerializer) {
      this.resultSerializer = this.operationArguments.resultSerializer
    }
  }

  async run() {
    try {
      this.queryResult = await this.operationArguments.query
    } catch (error) {
      this.fail((error as Error).message)
    }
    return this
  }

  result() {
    return this.resultSerializer(this.queryResult)
  }
}

export const databaseQuery = <Result, Serialized = Result[]>(
  args: ApplicationOperationArguments<
    DatabaseQueryArguments<Result, Serialized>
  >,
) => new DatabaseQuery<Result, Serialized>(args)

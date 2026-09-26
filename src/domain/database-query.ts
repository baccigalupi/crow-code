import type { DatabaseQuerySerializer, Logger } from '../types.ts'

const defaultSerializer = <T>(value: T): T => value // passes values through unchanged

export class DatabaseQuery<Result, Serialized = Result[]> {
  private query: PromiseLike<Result[]>
  private logger: Logger
  private queryResult: Result[]
  private succeeded: boolean
  private resultSerializer: DatabaseQuerySerializer<Result[], Serialized>

  constructor(
    query: PromiseLike<Result[]>,
    logger: Logger,
    resultSerializer: DatabaseQuerySerializer<Result[], Serialized> =
      defaultSerializer as DatabaseQuerySerializer<Result[], Serialized>,
  ) {
    this.query = query
    this.logger = logger
    this.queryResult = []
    this.succeeded = false
    this.resultSerializer = resultSerializer
  }

  async run() {
    try {
      await this.runQuery()
    } catch (error) {
      this.handleError(error)
    }
    return this
  }

  success() {
    return this.succeeded
  }

  result() {
    return this.resultSerializer(this.queryResult)
  }

  private async runQuery() {
    this.queryResult = await this.query
    this.succeeded = true
  }

  private handleError(error: unknown) {
    this.logger.error((error as Error).message)
  }
}

export const databaseQuery = async <Result, Serialized = Result[]>(
  query: PromiseLike<Result[]>,
  logger: Logger,
  resultSerializer: DatabaseQuerySerializer<Result[], Serialized> =
    defaultSerializer as DatabaseQuerySerializer<Result[], Serialized>,
) => await new DatabaseQuery(query, logger, resultSerializer).run()

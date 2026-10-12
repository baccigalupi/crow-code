import type { AsyncOperation, Logger } from '../types.ts'

type VerifyDatabaseArguments = {
  database: () => Promise<unknown>
  logger: Logger
}

export class VerifyDatabase implements AsyncOperation {
  private logPrefix = 'Database: '
  private database: () => Promise<unknown>
  private logger: Logger
  private succeeded = true
  reason = ''

  constructor({ database, logger }: VerifyDatabaseArguments) {
    this.database = database
    this.logger = logger
  }

  async run() {
    try {
      await this.database()
    } catch (error) {
      this.fail((error as Error).message)
    }
    return this
  }

  success() {
    return this.succeeded
  }

  private fail(reason: string) {
    this.succeeded = false
    this.reason = reason
    this.logger.error(`${this.logPrefix}${reason}`)
  }
}

export const verifyDatabase = (args: VerifyDatabaseArguments) => {
  return new VerifyDatabase(args)
}

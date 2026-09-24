import { defaultDatabasePath, openDatabase } from './open-database.ts'
import type { Logger } from '../types.ts'

export const setupDatabase = async (
  crowDirectory: string,
  logger: Logger,
) => {
  const database = await openDatabase(crowDirectory, logger)
  await database.destroy()
  logger.info(`Created crow database at ${defaultDatabasePath(crowDirectory)}`)
}

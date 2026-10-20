import { join } from 'node:path'
import pino from 'pino'

export const createLogger = (crowDirectory: string, level: pino.Level) => {
  const logPath = join(crowDirectory, 'logs', 'development.log')
  return pino(
    { level },
    pino.destination({ dest: logPath, sync: true, mkdir: true }),
  )
}

import { join } from '@std/path'
import pino from 'pino'

export const createLogger = (crowDirectory: string, level: pino.Level) => {
  const logDirectory = join(crowDirectory, 'logs')
  Deno.mkdirSync(logDirectory, { recursive: true })
  const logPath = join(logDirectory, 'development.log')
  return pino({ level }, pino.destination({ dest: logPath, sync: true }))
}

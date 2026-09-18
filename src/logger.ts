import { join } from '@std/path'
import pino from 'pino'
import type { Logger } from './model-info/types.ts'

export const createLogger = (
  crowDirectory: string,
  level: pino.Level,
): Logger => {
  const logDirectory = join(crowDirectory, 'logs')
  Deno.mkdirSync(logDirectory, { recursive: true })
  const logPath = join(logDirectory, 'development.log')
  return pino({ level }, pino.destination({ dest: logPath, sync: true }))
}

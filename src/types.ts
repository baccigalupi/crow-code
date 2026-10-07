import type pino from 'pino'
import type { ApplicationData } from './application-data.ts'

export type Logger = pino.Logger

export type ApplicationOperationArguments<T> = {
  applicationData: ApplicationData
  operationArguments: T
}

export type ConsoleLog = typeof console.log
export type DenoCommand = typeof Deno.Command
export type RealPath = typeof Deno.realPath

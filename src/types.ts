import type pino from 'pino'
import type { ApplicationData } from './application-data.ts'

export type Logger = pino.Logger

export type ApplicationOperationArguments<T> = {
  applicationData: ApplicationData
  operationArguments: T
}

export interface AsyncOperation {
  run(): Promise<AsyncOperation>
  success(): boolean
  reason: string
}

export interface AsyncOperationWithResult<Result> extends AsyncOperation {
  result(): Result
}

export type ConsoleLog = typeof console.log
export type DenoCommand = typeof Deno.Command
export type RealPath = typeof Deno.realPath

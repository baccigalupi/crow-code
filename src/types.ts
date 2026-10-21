import type pino from 'pino'
import type { ApplicationData } from './application-data/application-data.ts'

export type Logger = pino.Logger

export type CrowPermissionsConfig = {
  ignore: string[]
  additionalRead: string[]
  additionalWrite: string[]
  escalateRead: string[]
  escalateWrite: string[]
  allowedLocalScripts: string[]
}

export type CrowConfigData = {
  crowGlobalDirectory: string
  envFile: string
  permissions: CrowPermissionsConfig
}

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
export type ConsoleError = typeof console.error
export type CommandOptions = { args: string[] }
export type CommandOutput = {
  success: boolean
  code: number
  stdout: string
  stderr: string
}
export type Command = (
  executable: string,
  options: CommandOptions,
) => Promise<CommandOutput>
export type Signal = 'SIGINT' | 'SIGTERM'

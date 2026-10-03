import knex, { type Knex } from 'knex'
import pino from 'pino'
import type OpenAI from 'openai'
import { stub } from '@std/testing/mock'
import { ApplicationData } from '../../src/application-data.ts'
import { Environment } from '../../src/env-vars.ts'
import type { ConsoleLog, DenoCommand, Logger } from '../../src/types.ts'
import type { OpenAiClientOptions } from '../../src/model-requests/types.ts'
import { mockFetchSuccess } from './mock-fetch.ts'

export type MockApplicationDataOverrides = {
  args?: string[]
  crowDirectory?: string
  logger?: Logger
  database?: Knex
  close?: () => Promise<void>
  consoleLog?: ConsoleLog
  fetch?: typeof fetch
  chatClient?: (options: OpenAiClientOptions) => OpenAI
  denoCommand?: DenoCommand
  envars?: Environment
}

export const mockApplicationData = (
  overrides: MockApplicationDataOverrides = {},
): ApplicationData => {
  const data = new ApplicationData()
  let database = overrides.database
  const lazyDatabase = () => {
    if (!database) {
      database = knex({
        client: 'better-sqlite3',
        connection: ':memory:',
        useNullAsDefault: true,
      })
    }
    return Promise.resolve(database)
  }

  const args = overrides.args ?? []
  const crowDirectory = overrides.crowDirectory ?? ''
  const logger = overrides.logger ?? pino({ enabled: false })
  const close = overrides.close ?? (() => Promise.resolve())
  const consoleLog = overrides.consoleLog ?? (() => {})
  const fetchClient = overrides.fetch ?? mockFetchSuccess({})
  const denoCommand = overrides.denoCommand ?? Deno.Command
  const envars = overrides.envars ?? new Environment({})

  stub(data, 'args', () => args)
  stub(data, 'crowDirectory', () => crowDirectory)
  stub(data, 'logger', () => logger)
  stub(data, 'database', lazyDatabase)
  stub(data, 'close', close)
  stub(data, 'consoleLog', () => consoleLog)
  stub(data, 'fetch', () => fetchClient)
  stub(data, 'denoCommand', () => denoCommand)
  stub(data, 'envars', () => envars)

  if (overrides.chatClient) {
    stub(data, 'chatClient', overrides.chatClient)
  }

  return data
}

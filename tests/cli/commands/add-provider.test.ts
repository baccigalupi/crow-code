import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { AddProvider } from '../../../src/cli/commands/add-provider.ts'
import { openAndMigrateDatabase } from '../../../src/database/open-and-migrate-database.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import pino from 'pino'

describe('AddProvider', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'add-provider')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'add-provider')))

  it('when the command is add-provider, matches', () => {
    const applicationData = mockApplicationData({ args: ['add-provider'] })

    const command = new AddProvider(applicationData)

    expect(command.isMatch()).toBe(true)
  })

  it('when the command is something else, does not match', () => {
    const applicationData = mockApplicationData({ args: ['git-commit'] })

    const command = new AddProvider(applicationData)

    expect(command.isMatch()).toBe(false)
  })

  it('when run with provider params, creates the provider in the injected crow directory', async () => {
    const crowDirectory = join(join(fixturesDirectory, 'add-provider'), '.crow')
    const database = await openAndMigrateDatabase(
      crowDirectory,
      pino({ enabled: false }),
    )
    const applicationData = mockApplicationData({
      args: [
        'add-provider',
        '--name=ollama',
        '--base-url=http://x',
        '--api-key-env-var=OLLAMA_KEY',
      ],
      crowDirectory,
      database,
    })

    await new AddProvider(applicationData).run()

    const rows = await database('providers').select('*')
    expect(rows).toEqual([{
      id: expect.any(Number),
      name: 'ollama',
      base_url: 'http://x',
      models_path: null,
      api_key_env_var: 'OLLAMA_KEY',
    }])
    await database.destroy()
  })

  it('when run succeeds, writes the .env key reminder', async () => {
    const crowDirectory = join(join(fixturesDirectory, 'add-provider'), '.crow')
    const database = await openAndMigrateDatabase(
      crowDirectory,
      pino({ enabled: false }),
    )
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: [
        'add-provider',
        '--name=ollama',
        '--base-url=http://x',
        '--api-key-env-var=OLLAMA_KEY',
      ],
      crowDirectory,
      database,
      consoleLog,
    })

    await new AddProvider(applicationData).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe(
      'Provider added. Add your api key <api_key> to the .env file',
    )
    await database.destroy()
  })

  it('when the provider has no api key env var, writes the reminder with a placeholder key', async () => {
    const crowDirectory = join(join(fixturesDirectory, 'add-provider'), '.crow')
    const database = await openAndMigrateDatabase(
      crowDirectory,
      pino({ enabled: false }),
    )
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: ['add-provider', '--name=ollama', '--base-url=http://x'],
      crowDirectory,
      database,
      consoleLog,
    })

    await new AddProvider(applicationData).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe(
      'Provider added. Add your api key <api_key> to the .env file',
    )
    await database.destroy()
  })

  it('when creation fails, writes the failure message', async () => {
    const crowDirectory = join(join(fixturesDirectory, 'add-provider'), '.crow')
    const database = await openAndMigrateDatabase(
      crowDirectory,
      pino({ enabled: false }),
    )
    await database('providers').insert({
      name: 'ollama',
      base_url: 'http://x',
    })
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: ['add-provider', '--name=other', '--base-url=http://x'],
      crowDirectory,
      database,
      consoleLog,
    })

    await new AddProvider(applicationData).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe(
      'Unable to create a provider',
    )
    const rows = await database('providers').select('*')
    expect(rows).toHaveLength(1)
    await database.destroy()
  })
})

import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { AddProvider } from '../../../src/cli/commands/add-provider.ts'
import { command } from '../../../src/cli/commands/command.ts'
import { CrowConfig } from '../../../src/application-data/config.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('AddProvider', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'add-provider')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'add-provider')))

  it('when the command is add-provider, matches', () => {
    const applicationData = mockApplicationData({ args: ['add-provider'] })

    const addProvider = command(AddProvider, applicationData)

    expect(addProvider.isMatch()).toBe(true)
  })

  it('when the command is something else, does not match', () => {
    const applicationData = mockApplicationData({ args: ['git-commit'] })

    const addProvider = command(AddProvider, applicationData)

    expect(addProvider.isMatch()).toBe(false)
  })

  it('when run with provider params, creates the provider in the injected crow directory', async () => {
    const applicationData = mockApplicationData({
      args: [
        'add-provider',
        '--name=ollama',
        '--base-url=http://x',
        '--api-key-env-var=OLLAMA_KEY',
      ],
    })
    const database = await applicationData.database()

    await command(AddProvider, applicationData).run()

    const rows = await database('providers').select('*')
    expect(rows).toEqual([{
      id: expect.any(Number),
      name: 'ollama',
      base_url: 'http://x',
      models_path: null,
      api_key_env_var: 'OLLAMA_KEY',
    }])
  })

  it('when run succeeds, writes the .env key reminder with the default path', async () => {
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: [
        'add-provider',
        '--name=ollama',
        '--base-url=http://x',
        '--api-key-env-var=OLLAMA_KEY',
      ],
      consoleLog,
    })

    await command(AddProvider, applicationData).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe(
      'Provider added. Add your api key <api_key> to ~/.crow/.env',
    )
  })

  it('when the config sets an env file, the reminder names that path', async () => {
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: ['add-provider', '--name=ollama', '--base-url=http://x'],
      consoleLog,
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '/secrets/crow.env',
        permissions: { ignore: [], additionalRead: [], additionalWrite: [] },
      }),
    })

    await command(AddProvider, applicationData).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe(
      'Provider added. Add your api key <api_key> to /secrets/crow.env',
    )
  })

  it('when the provider has no api key env var, writes the reminder with a placeholder key', async () => {
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: ['add-provider', '--name=ollama', '--base-url=http://x'],
      consoleLog,
    })

    await command(AddProvider, applicationData).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe(
      'Provider added. Add your api key <api_key> to ~/.crow/.env',
    )
  })

  it('when creation fails, writes the failure message', async () => {
    const consoleLog = mock.fn()
    const consoleError = mock.fn()
    const applicationData = mockApplicationData({
      args: ['add-provider', '--name=other', '--base-url=http://x'],
      consoleLog,
      consoleError,
    })
    const database = await applicationData.database()
    await database('providers').insert({
      name: 'ollama',
      base_url: 'http://x',
    })

    const addProvider = command(AddProvider, applicationData)
    await addProvider.run()
    addProvider.reportFailure()

    expect(consoleError.mock.calls[0].arguments[0]).toBe(
      'Error: unable to create a provider for add-provider',
    )
    expect(consoleLog.mock.calls).toHaveLength(0)
    const rows = await database('providers').select('*')
    expect(rows).toHaveLength(1)
  })
})

import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { CreateModelCatalog } from '../../../src/cli/commands/create-model-catalog.ts'
import { Environment } from '../../../src/env-vars.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import { mockFetchRoutes } from '../../support/mock-fetch.ts'
import pino from 'pino'

const fixtureDirectory = join(fixturesDirectory, 'create-model-catalog')

describe('CreateModelCatalog', () => {
  beforeEach(() => clearDirectory(fixtureDirectory))
  afterEach(() => clearDirectory(fixtureDirectory))

  it('when the command is create-model-catalog, matches', () => {
    const command = new CreateModelCatalog({
      parsedArguments: { commands: ['create-model-catalog'], options: {} },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(command.isMatch()).toBe(true)
  })

  it('when the command is something else, does not match', () => {
    const command = new CreateModelCatalog({
      parsedArguments: { commands: ['git-commit'], options: {} },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(command.isMatch()).toBe(false)
  })

  it('when options are passed, extracts none of them', () => {
    const command = new CreateModelCatalog({
      parsedArguments: {
        commands: ['create-model-catalog'],
        options: { verbose: true },
      },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(command.extractOptions()).toEqual({})
  })

  it('when run, builds the catalog into the injected crow directory', async () => {
    const crowDirectory = join(fixtureDirectory, '.crow')
    await Deno.mkdir(crowDirectory, { recursive: true })
    await Deno.writeTextFile(
      join(crowDirectory, 'providers.json'),
      JSON.stringify({
        providers: [{
          name: 'ollama',
          baseUrl: 'http://pile-driver.local:11434',
          modelsUrl: 'http://pile-driver.local:11434/api/tags',
        }],
      }),
    )
    const fetchMock = mockFetchRoutes([['pile-driver', { models: [] }]])

    await new CreateModelCatalog({
      parsedArguments: { commands: ['create-model-catalog'], options: {} },
      crowDirectory,
      logger: pino({ enabled: false }),
      consoleLog: () => {},
      fetchClient: fetchMock,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    }).run()

    expect(Deno.statSync(join(crowDirectory, 'models.json')).isFile).toBe(true)
  })
})

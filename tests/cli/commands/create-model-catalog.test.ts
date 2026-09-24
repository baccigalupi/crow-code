import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import {
  CreateModelCatalog,
  CreateModelCatalogMatch,
} from '../../../src/cli/commands/create-model-catalog.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import { mockFetchRoutes } from '../../support/mock-fetch.ts'
import pino from 'pino'

const fixtureDirectory = join(fixturesDirectory, 'create-model-catalog')

describe('CreateModelCatalog', () => {
  beforeEach(() => clearDirectory(fixtureDirectory))
  afterEach(() => clearDirectory(fixtureDirectory))

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
    const logger = pino({ enabled: false })
    const fetchMock = mockFetchRoutes([['pile-driver', { models: [] }]])

    await new CreateModelCatalog({
      crowDirectory,
      logger,
      consoleLog: () => {},
      fetchClient: fetchMock,
    }).run()

    expect(fetchMock.calls).toHaveLength(1)
    expect(Deno.statSync(join(crowDirectory, 'models.json')).isFile).toBe(true)
  })
})

describe('CreateModelCatalogMatch', () => {
  it('when the command is create-model-catalog, returns true', () => {
    const match = new CreateModelCatalogMatch({
      commands: ['create-model-catalog'],
      options: {},
    })

    expect(match.isMatch()).toBe(true)
  })

  it('when the command is something else, returns false', () => {
    const match = new CreateModelCatalogMatch({
      commands: ['git-commit'],
      options: {},
    })

    expect(match.isMatch()).toBe(false)
  })

  it('returns no extracted options', () => {
    const match = new CreateModelCatalogMatch({
      commands: ['create-model-catalog'],
      options: { verbose: true },
    })

    expect(match.extractOptions()).toEqual({})
  })
})

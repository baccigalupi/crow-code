import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { CreateModelCatalog } from '../../../src/cli/commands/create-model-catalog.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import { mockFetchSuccess } from '../../support/mock-fetch.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { createTestDatabase } from '../../support/test-database.ts'
import pino from 'pino'

describe('CreateModelCatalog', () => {
  beforeEach(() =>
    clearDirectory(join(fixturesDirectory, 'create-model-catalog'))
  )
  afterEach(() =>
    clearDirectory(join(fixturesDirectory, 'create-model-catalog'))
  )

  it('when the command is create-model-catalog, matches', () => {
    const applicationData = mockApplicationData({
      args: ['create-model-catalog'],
    })

    const command = new CreateModelCatalog(applicationData)

    expect(command.isMatch()).toBe(true)
  })

  it('when the command is something else, does not match', () => {
    const applicationData = mockApplicationData({ args: ['git-commit'] })

    const command = new CreateModelCatalog(applicationData)

    expect(command.isMatch()).toBe(false)
  })

  it('when run, populates models from database providers', async () => {
    const database = await createTestDatabase(pino({ enabled: false }))
    await database('providers').insert({
      name: 'ollama',
      base_url: 'http://pile-driver.local:11434',
      models_path: '/api/tags',
      api_key_env_var: null,
    })
    const fetchMock = mockFetchSuccess({
      models: [{ name: 'author/model', details: { context_length: 128000 } }],
    })
    const applicationData = mockApplicationData({
      args: ['create-model-catalog'],
      crowDirectory: join(fixturesDirectory, 'create-model-catalog', '.crow'),
      database,
      fetch: fetchMock,
    })

    await new CreateModelCatalog(applicationData).run()

    expect(await database('models').select('identifier')).toEqual([
      { identifier: 'author/model' },
    ])
    await database.destroy()
  })
})

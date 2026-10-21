import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { join } from 'node:path'
import { CreateModelCatalog } from '../../../src/cli/commands/create-model-catalog.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import { mockFetchSuccess } from '../../support/mock-fetch.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

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

    const catalog = new CreateModelCatalog({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    expect(catalog.isMatch()).toBe(true)
  })

  it('when the command is something else, does not match', () => {
    const applicationData = mockApplicationData({ args: ['git-commit'] })

    const catalog = new CreateModelCatalog({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    expect(catalog.isMatch()).toBe(false)
  })

  it('when run, populates models from database providers', async () => {
    const fetchMock = mockFetchSuccess({
      models: [{ name: 'author/model', details: { context_length: 128000 } }],
    })
    const applicationData = mockApplicationData({
      args: ['create-model-catalog'],
      fetch: fetchMock,
    })
    const database = await applicationData.database()
    await database('providers').insert({
      name: 'ollama',
      base_url: 'http://pile-driver.local:11434',
      models_path: '/api/tags',
      api_key_env_var: null,
    })

    await new CreateModelCatalog({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    }).run()

    expect(await database('models').select('identifier')).toEqual([
      { identifier: 'author/model' },
    ])
  })
})

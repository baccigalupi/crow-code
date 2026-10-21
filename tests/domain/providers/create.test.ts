import { describe, expect, it, spyOn } from 'bun:test'
import pino from 'pino'
import {
  CreateProvider,
  createProvider,
} from '../../../src/domain/providers/create.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('create', () => {
  it('when options include extra values, normalizes and filters them', async () => {
    const logger = pino({ enabled: false })
    const applicationData = mockApplicationData({ logger })
    const options = {
      name: 'provider-name',
      'base-url': 'https://www.example.com',
      'models-path': '/v1/models',
      'api-key-env-var': 'X',
      extra: 'ignored',
    }

    const creator = await createProvider(applicationData, options).run()

    expect(creator.success()).toBe(true)
    expect(creator.result()).toEqual({
      id: expect.any(Number),
      name: 'provider-name',
      base_url: 'https://www.example.com',
      models_path: '/v1/models',
      api_key_env_var: 'X',
    })
  })

  it('when create has not been called, success is false and the record is empty', () => {
    const logger = pino({ enabled: false })
    const applicationData = mockApplicationData({ logger })

    const creator = new CreateProvider({
      applicationData,
      operationArguments: {},
    })

    expect(creator.success()).toBe(false)
    expect(creator.result()).toEqual({})
  })

  it('when the provider already exists, reports failure', async () => {
    const logger = pino({ enabled: false })
    const applicationData = mockApplicationData({ logger })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')
    const database = await applicationData.database()
    await database('providers').insert({
      name: 'provider-name',
      base_url: 'https://www.example.com',
    })
    const options = {
      name: 'provider-name',
      'base-url': 'https://www.example.com',
    }

    const creator = await createProvider(applicationData, options).run()

    expect(creator.success()).toBe(false)
    expect(creator.result()).toEqual({})
    expect(loggerErrorSpy).toHaveBeenCalled()
    const logged = loggerErrorSpy.mock.calls[0][0] as string
    expect(logged).toContain('Create provider:')
  })
})

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { Environment } from '../../../src/application-data/env-vars.ts'
import { ProviderEntity } from '../../../src/domain/providers/entity.ts'
import { providerFindBy } from '../../../src/domain/providers/find-by.ts'
import { createTestDatabase } from '../../support/test-database.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('providerFindBy', () => {
  describe('getByName', () => {
    it('returns the provider when it exists', async () => {
      const environment = new Environment({ PROVIDER_API_KEY: 'secret' })
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert({
        name: 'provider-name',
        base_url: 'https://www.example.com',
        models_path: '/models',
        api_key_env_var: 'PROVIDER_API_KEY',
      })
      const applicationData = mockApplicationData({
        envars: environment,
        database,
        logger,
      })

      const provider = await providerFindBy(applicationData)
        .getByName('provider-name')

      expect(provider).toBeInstanceOf(ProviderEntity)
      const foundProvider = provider as ProviderEntity
      expect(foundProvider.name()).toBe('provider-name')
      expect(foundProvider.baseUrl()).toBe('https://www.example.com')
      expect(foundProvider.modelsUrl()).toBe('https://www.example.com/models')
      expect(foundProvider.apiKey()).toBe('secret')
    })

    it('returns undefined when the provider does not exist', async () => {
      const environment = new Environment({})
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      const applicationData = mockApplicationData({
        envars: environment,
        database,
        logger,
      })

      const provider = await providerFindBy(applicationData)
        .getByName('missing')

      expect(provider).toBeUndefined()
    })

    it('returns the matching provider among several', async () => {
      const environment = new Environment({})
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert([
        {
          name: 'provider-one',
          base_url: 'https://www.example.com/one',
          models_path: '/models',
          api_key_env_var: null,
        },
        {
          name: 'provider-two',
          base_url: 'https://www.example.com/two',
          models_path: '/models',
          api_key_env_var: null,
        },
      ])
      const applicationData = mockApplicationData({
        envars: environment,
        database,
        logger,
      })

      const provider = await providerFindBy(applicationData)
        .getByName('provider-two')

      expect(provider).toBeInstanceOf(ProviderEntity)
      const foundProvider = provider as ProviderEntity
      expect(foundProvider.name()).toBe('provider-two')
    })
  })

  describe('getById', () => {
    it('returns the provider when it exists', async () => {
      const environment = new Environment({ PROVIDER_API_KEY: 'secret' })
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      const [{ id }] = await database('providers').insert({
        name: 'provider-name',
        base_url: 'https://www.example.com',
        models_path: '/models',
        api_key_env_var: 'PROVIDER_API_KEY',
      }).returning('id')
      const applicationData = mockApplicationData({
        envars: environment,
        database,
        logger,
      })

      const provider = await providerFindBy(applicationData)
        .getById(id)

      expect(provider).toBeInstanceOf(ProviderEntity)
      const foundProvider = provider as ProviderEntity
      expect(foundProvider.name()).toBe('provider-name')
    })

    it('returns undefined when the provider does not exist', async () => {
      const environment = new Environment({})
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      const applicationData = mockApplicationData({
        envars: environment,
        database,
        logger,
      })

      const provider = await providerFindBy(applicationData)
        .getById(999)

      expect(provider).toBeUndefined()
    })

    it('returns the matching provider among several', async () => {
      const environment = new Environment({})
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert({
        name: 'provider-one',
        base_url: 'https://www.example.com/one',
        models_path: '/models',
        api_key_env_var: null,
      })
      const [{ id }] = await database('providers').insert({
        name: 'provider-two',
        base_url: 'https://www.example.com/two',
        models_path: '/models',
        api_key_env_var: null,
      }).returning('id')
      const applicationData = mockApplicationData({
        envars: environment,
        database,
        logger,
      })

      const provider = await providerFindBy(applicationData)
        .getById(id)

      expect(provider).toBeInstanceOf(ProviderEntity)
      const foundProvider = provider as ProviderEntity
      expect(foundProvider.name()).toBe('provider-two')
    })
  })
})

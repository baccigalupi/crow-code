import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { Environment } from '../../../src/env-vars.ts'
import { ProviderModel } from '../../../src/domain/providers/provider.ts'
import { providerFindBy } from '../../../src/domain/providers/find-by.ts'
import { createTestDatabase } from '../../support/test-database.ts'

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

      const provider = await providerFindBy(environment, database, logger)
        .getByName('provider-name')

      expect(provider).toBeInstanceOf(ProviderModel)
      const foundProvider = provider as ProviderModel
      expect(foundProvider.name()).toBe('provider-name')
      expect(foundProvider.baseUrl()).toBe('https://www.example.com')
      expect(foundProvider.modelsUrl()).toBe('https://www.example.com/models')
      expect(foundProvider.apiKey()).toBe('secret')
      await database.destroy()
    })

    it('returns undefined when the provider does not exist', async () => {
      const environment = new Environment({})
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)

      const provider = await providerFindBy(environment, database, logger)
        .getByName('missing')

      expect(provider).toBeUndefined()
      await database.destroy()
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

      const provider = await providerFindBy(environment, database, logger)
        .getById(id)

      expect(provider).toBeInstanceOf(ProviderModel)
      const foundProvider = provider as ProviderModel
      expect(foundProvider.name()).toBe('provider-name')
      await database.destroy()
    })

    it('returns undefined when the provider does not exist', async () => {
      const environment = new Environment({})
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)

      const provider = await providerFindBy(environment, database, logger)
        .getById(999)

      expect(provider).toBeUndefined()
      await database.destroy()
    })
  })
})
